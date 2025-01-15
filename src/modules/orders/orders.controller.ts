import { Controller, Get, Post, Body, Patch, Param, Req, UseGuards, ParseUUIDPipe, Query, ParseIntPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard } from '../../guards/auth.guard';
import { AdminGuard } from '../../guards/admin.guard';
import { ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { OrderResponseDto } from './dto/order-response.dto';

@ApiTags("Orders")
@ApiSecurity("bearer")
@Controller("orders")
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: "Create a new order" })
  @ApiResponse({ status: 201, description: "Order created successfully", type: OrderResponseDto })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Req() request) {
    const userId = request.user.sub;
    return await this.ordersService.createOrder(createOrderDto, userId);
  }

  @ApiOperation({ summary: "Get all orders (Admin only)" })
  @ApiResponse({ status: 200, description: "Orders retrieved successfully", type: [OrderResponseDto] })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden (Admin access only)" })
  @Get("/admin")
  @UseGuards(AdminGuard)
  async findAllOrders(
    @Query("page", ParseIntPipe) page?: number,
    @Query("limit", ParseIntPipe) limit?: number,
  ) {
    return await this.ordersService.getAllOrders(page, limit);
  };

  @ApiOperation({ summary: "Get orders for the authenticated user" })
  @ApiResponse({ status: 200, description: "User orders retrieved successfully", type: [OrderResponseDto] })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @Get()
  async findUserOrdersByUser(
    @Req() request,
    @Query("page", ParseIntPipe) page?: number,
    @Query("limit", ParseIntPipe) limit?: number,
  ) {
    return await this.ordersService.findOrdersByUser(request.user.sub, page, limit);
  };

  @ApiOperation({ summary: "Get a user's orders (Admin only)" })
  @ApiResponse({ status: 200, description: "User orders retrieved successfully", type: [OrderResponseDto] })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden (Admin access only)" })
  @Get("/users/:userId")
  @UseGuards(AdminGuard)
  async findUserOrdersByAdmin(
    @Param("userId", ParseUUIDPipe) userId: string,
    @Query("page", ParseIntPipe) page?: number,
    @Query("limit", ParseIntPipe) limit?: number,
  ) {
    return await this.ordersService.findOrdersByUser(userId, page, limit);
  };

  @ApiOperation({ summary: "Admin fetches a specific order" })
  @ApiResponse({ status: 200, description: "Order retrieved successfully", type: OrderResponseDto })
  @ApiResponse({ status: 404, description: "Order not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden (Admin access only)" })
  @Get("/:id/admin")
  @UseGuards(AdminGuard)
  async adminFindOrder(@Param("id", ParseUUIDPipe) id: string) {
   return await this.ordersService.findOrderById(id);
  };

  @ApiOperation({ summary: "User fetches their specific order" })
  @ApiResponse({ status: 200, description: "Order retrieved successfully", type: OrderResponseDto })
  @ApiResponse({ status: 404, description: "Order not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @Get(":id")
  async userFindOrder(@Param("id", ParseUUIDPipe) orderId: string, @Req() request) {
    return await this.ordersService.findOrderById(orderId, request.user.sub);
  };

  @ApiOperation({ summary: "Update an order (Admin only)" })
  @ApiResponse({ status: 200, description: "Order updated successfully", type: OrderResponseDto })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 404, description: "Order not found" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden (Admin access only)" })
  @Patch(":id")
  @UseGuards(AdminGuard)
  async updateOrder(@Param("id", ParseUUIDPipe) orderId: string, @Body() updateOrderDto: UpdateOrderDto) {
    return await this.ordersService.updateOrder(orderId, updateOrderDto);
  };
}
