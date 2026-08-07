import { IsString, IsNotEmpty } from 'class-validator';

export class AssignTableDto {
  @IsString()
  @IsNotEmpty()
  tableId!: string;
}

export class ChangeTableDto {
  @IsString()
  @IsNotEmpty()
  newTableId!: string;
}
