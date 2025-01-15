import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsObject, IsString } from "class-validator";

export class AuthResponseDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty()
  @IsObject()
  data: object;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  access_token: string
};