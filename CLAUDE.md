# CLAUDE.md - POS Portfolio Project

## Project Overview
This is a Point of Sale (POS) portfolio

## MCP Server
This project uses `my-mcp-server-erp-lite-local` MCP server for database operations:
- **Host**: 127.0.0.1
- **Database**: erp_lite
- **Port**: 3306
- **User**: superuser

### Available MCP Tools
- `mcp__my-mcp-server-erp-lite-local__list_tables` - List all tables in database
- `mcp__my-mcp-server-erp-lite-local__describe_table` - View schema/structure of a table
- `mcp__my-mcp-server-erp-lite-local__read_query` - Execute SELECT queries
- `mcp__my-mcp-server-erp-lite-local__write_query` - Execute INSERT, UPDATE, DELETE
- `mcp__my-mcp-server-erp-lite-local__create_table` - Create new tables
- `mcp__my-mcp-server-erp-lite-local__alter_table` - Modify existing table schema
- `mcp__my-mcp-server-erp-lite-local__drop_table` - Remove tables
- `mcp__my-mcp-server-erp-lite-local__export_query` - Export query results to CSV/JSON
- `mcp__my-mcp-server-erp-lite-local__list_insights` - List business insights
- `mcp__my-mcp-server-erp-lite-local__append_insight` - Add business insights

## Important Guidelines

### Database First Principle
**WAJIB** - Setiap kali melakukan perubahan terkait module dan fitur (baik itu feature baru, enhancement, bug fixing, atau perubahan lainnya) yang melibatkan MCP server `my-mcp-server-erp-lite-local`:

1. **SELALU check database terlebih dahulu** menggunakan MCP tools untuk:
   - Melihat struktur table yang relevan dengan `describe_table`
   - Memahami relasi antar tabel dengan `read_query`
   - Memastikan column/field yang diperlukan sudah ada
   - Memahami data type dan constraints

2. **Langkah yang harus dilakukan SEBELUM menulis kode**:
   ```
   1. Identify tabel-tabel yang relevan dengan fitur
   2. Jalankan describe_table untuk setiap tabel
   3. Check data sample dengan read_query jika perlu
   4. Baru kemudian implementasikan kode frontend/backend
   ```

3. **Contoh Penggunaan**:
   - Sebelum menambah field baru → `describe_table` tabel terkait
   - Sebelum mengubah logic → `read_query` untuk lihat data existing
   - Sebelum fix bug → Check struktur dan data di database
   - Sebelum add feature → Pastikan tabel dan relasi sudah dipahami


## Development Workflow
1. Check database structure first (WAJIB)
2. Understand existing code structure
3. Implement changes in backend first (if needed)
4. Then implement frontend changes
5. Test the integration

## Commands
- Frontend: `cd frontend && npm run dev`
- Backend: `cd backend && npm run dev` or `npm start`