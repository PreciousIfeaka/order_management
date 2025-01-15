import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateChatRoomDto {
  @ApiProperty({
    description: "The summary for closing the chat room",
    default: "The order has been reviewed.",
  })
  @IsNotEmpty()
  @IsString()
  summary: string;
}
