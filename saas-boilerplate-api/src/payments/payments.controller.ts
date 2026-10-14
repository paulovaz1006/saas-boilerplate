import { BadRequestException, Controller, Headers, Post, Body, Req, Res, UseGuards, RawBodyRequest } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'; import { Repository } from 'typeorm'; import { Request, Response } from 'express'; import Stripe from 'stripe'; import { User } from '../users/user.entity'; import { Plan } from '../plans/plan.entity'; import { Subscription } from './subscription.entity'; import { JwtAuthGuard } from '../auth/jwt-auth.guard';
@Controller('payments') export class PaymentsController {
 private stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
 constructor(@InjectRepository(User) private users:Repository<User>, @InjectRepository(Plan) private plans:Repository<Plan>, @InjectRepository(Subscription) private subs:Repository<Subscription>) {}
 @Post('checkout') @UseGuards(JwtAuthGuard) async checkout(@Req() req:Request, @Body() body:{planKey:string;interval?:'monthly'|'yearly'}) {
  if (!this.stripe) throw new BadRequestException('Stripe não configurado'); const interval=body.interval==='yearly'?'yearly':'monthly';
  const plan=await this.plans.findOneBy({key:body.planKey}); if(!plan || !['starter','pro'].includes(plan.key)) throw new BadRequestException('Plano não disponível para checkout');
  const price=interval==='yearly'?plan.stripeYearlyPriceId:plan.stripeMonthlyPriceId; if(!price) throw new BadRequestException(`Configure o Price ID Stripe ${plan.key}/${interval}`);
  const user=await this.users.findOneByOrFail({id:(req as any).user.sub});
  const session=await this.stripe.checkout.sessions.create({mode:'subscription',line_items:[{price,quantity:1}],customer_email:user.email,client_reference_id:user.id,metadata:{userId:user.id,planKey:plan.key,billingInterval:interval},subscription_data:{metadata:{userId:user.id,planKey:plan.key,billingInterval:interval}},success_url:(process.env.WEB_ORIGIN||'http://localhost:3000')+'/dashboard?checkout=success',cancel_url:(process.env.WEB_ORIGIN||'http://localhost:3000')+'/?checkout=cancel'});
  return {url:session.url};
 }
 @Post('webhook') async webhook(@Req() req:RawBodyRequest<Request>, @Headers('stripe-signature') signature:string) {
  if(!this.stripe || !process.env.STRIPE_WEBHOOK_SECRET) throw new BadRequestException('Webhook Stripe não configurado'); let event:Stripe.Event;
  try { event=this.stripe.webhooks.constructEvent(req.rawBody!,signature,process.env.STRIPE_WEBHOOK_SECRET); } catch { throw new BadRequestException('Assinatura Stripe inválida'); }
  if(event.type==='checkout.session.completed') {
   const session=event.data.object as Stripe.Checkout.Session; const userId=session.metadata?.userId || session.client_reference_id; const planKey=session.metadata?.planKey; const interval=session.metadata?.billingInterval || 'monthly';
   if(userId && planKey && session.subscription) { const plan=await this.plans.findOneBy({key:planKey}); if(plan) { const existing=await this.subs.findOneBy({stripeSubscriptionId:String(session.subscription)}); if(!existing) await this.subs.save(this.subs.create({userId,planId:plan.id,status:'active',billingInterval:interval,stripeCustomerId:String(session.customer||''),stripeSubscriptionId:String(session.subscription)})); } }
  }
  if(event.type==='customer.subscription.deleted' || event.type==='customer.subscription.updated') { const s=event.data.object as Stripe.Subscription; const existing=await this.subs.findOneBy({stripeSubscriptionId:s.id}); if(existing) { existing.status=s.status; existing.currentPeriodEnd=new Date(s.current_period_end*1000); await this.subs.save(existing); } }
  return {received:true};
 }
}
