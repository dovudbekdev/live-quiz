import { PartialType } from '@nestjs/swagger';
import { CreateQuestionWithOptionsDto } from './create-question.dto';

export class UpdateQuestionDto extends PartialType(CreateQuestionWithOptionsDto) {}
