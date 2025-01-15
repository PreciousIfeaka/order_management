import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class SendMessageDto {
  @ApiProperty({
    description: "The message to be sent",
    default: "Hi! I just made an order",
  })
  @IsNotEmpty()
  @IsString()
  message: string
}
