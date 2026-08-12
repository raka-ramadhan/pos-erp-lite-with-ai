import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionListQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../common/guards/permission.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';

@Controller('transactions')
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission('view_transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * List all transactions with pagination and filters
   */
  @Get()
  findAll(@Query() query: TransactionListQueryDto) {
    return this.transactionsService.findAll(query);
  }

  /**
   * Get transaction detail by ID
   */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.transactionsService.findOne(id);
  }

  /**
   * Get receipt data for a transaction
   */
  @Get(':id/receipt')
  getReceipt(@Param('id', ParseUUIDPipe) id: string) {
    return this.transactionsService.getReceipt(id);
  }
}
