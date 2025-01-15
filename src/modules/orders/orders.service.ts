import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatRoomService } from '../chat-room/chat-room.service';
import { OrderResponseDto } from './dto/order-response.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService, private chatRoomService: ChatRoomService) {}
  async createOrder(createOrderDto: CreateOrderDto, userId: string): Promise<OrderResponseDto> {
    const order = await this.prisma.order.create({
      data: {
        ...createOrderDto,
        userId
      }
    });

    await this.chatRoomService.createChatRoom(order.id);

    const findOrder = await this.prisma.order.findUnique({
      where: { id: order.id },
      include: { chatRoom: true }
    })

    return {
      message: "Successfully created order and chat room",
      data: findOrder
    };
  };

  async findOrdersByUser(userId: string, page?: number, limit?: number): Promise<OrderResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId}
    });
    if (!user) throw new NotFoundException("User not found");

    const orders = await this.prisma.order.findMany({
      take: limit || 10,
      skip: page - 1 || 0,
      where: { userId }
    });

    return {
      message: "Successfully retrieved orders",
      data: orders
    };
  };

  async getAllOrders(page?: number, limit?: number): Promise<OrderResponseDto> {
    const orders = await this.prisma.order.findMany({
      take: limit || 10,
      skip: page - 1 || 0,
      include: { chatRoom: true }
    });

    return {
      message: "Successfully retrieved all orders",
      data: orders
    };
  };

  async findOrderById(orderId: string, userId?: string): Promise<OrderResponseDto> {
    const order = userId
      ? await this.prisma.order.findUnique({ 
          where: { id: orderId, userId },
          include: { chatRoom: true }
        })
      : await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { chatRoom: true }
      })
    if (!order) throw new NotFoundException("Order not found");

    return {
      message: "Successfully retrieved order",
      data: order
    };
  };

  async updateOrder(orderId: string, updateOrderDto: UpdateOrderDto): Promise<OrderResponseDto> {
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId},
      data: updateOrderDto
    });

    return {
      message: "Successfully updated order",
      data: updatedOrder
    };
  };
}
