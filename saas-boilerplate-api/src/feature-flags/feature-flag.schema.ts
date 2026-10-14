import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'; import { HydratedDocument } from 'mongoose';
export type FeatureFlagDocument = HydratedDocument<FeatureFlag>;
@Schema({ timestamps:true, collection:'feature_flags' }) export class FeatureFlag { @Prop({required:true,unique:true,index:true}) key:string; @Prop({default:false}) enabled:boolean; @Prop({default:''}) description:string; @Prop({type:[String],default:[]}) allowedPlans:string[]; @Prop({default:100,min:0,max:100}) rolloutPercentage:number; }
export const FeatureFlagSchema=SchemaFactory.createForClass(FeatureFlag);
