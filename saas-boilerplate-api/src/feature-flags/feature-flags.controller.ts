import { Controller,Get,Post,Body,ForbiddenException } from '@nestjs/common'; import { InjectModel } from '@nestjs/mongoose'; import { Model } from 'mongoose'; import { FeatureFlag,FeatureFlagDocument } from './feature-flag.schema';
@Controller('feature-flags') export class FeatureFlagsController { constructor(@InjectModel(FeatureFlag.name) private flags:Model<FeatureFlagDocument>) {}
 @Get() async list(){return this.flags.find({}, { _id:0,__v:0 }).lean();}
 // Endpoint de escrita temporário para desenvolvimento. Antes de produção, proteger com guard de administrador.
 @Post() async upsert(@Body() body:Partial<FeatureFlag> & {key:string}) { if(!/^[a-z][a-z0-9_.-]{1,79}$/.test(body.key||'')) throw new ForbiddenException('Chave de flag inválida'); return this.flags.findOneAndUpdate({key:body.key},{$set:{enabled:!!body.enabled,description:body.description||'',allowedPlans:body.allowedPlans||[],rolloutPercentage:Math.max(0,Math.min(100,Number(body.rolloutPercentage??100)))}},{upsert:true,new:true}).select('-_id -__v').lean(); }
}
