import { PartialType } from "@nestjs/mapped-types";
import { CreateOrderDto } from "./create-order.dto";
import { IsEnum, IsOptional } from "class-validator";
import { OrderState } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @ApiProperty({ enum: ["USER", "ADMIN"] })
  @IsOptional()
  @IsEnum(OrderState)
  state: OrderState;
}
