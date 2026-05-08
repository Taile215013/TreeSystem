CREATE TYPE "public"."environment" AS ENUM('Outdoor', 'Indoor', 'Hybrid');--> statement-breakpoint
CREATE TYPE "public"."expense_type" AS ENUM('fixed', 'variable');--> statement-breakpoint
CREATE TYPE "public"."expense_category" AS ENUM('electric', 'water', 'internet', 'food', 'fuel', 'salary_fixed', 'salary_parttime', 'rent', 'marketing', 'maintenance', 'other');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'processing', 'shipped', 'delivered', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('paid', 'pending');--> statement-breakpoint
CREATE TYPE "public"."plant_type" AS ENUM('Flower', 'Leaf', 'Fruit');--> statement-breakpoint
CREATE TYPE "public"."product_status" AS ENUM('active', 'draft', 'archived');--> statement-breakpoint
CREATE TYPE "public"."stock_change_reason" AS ENUM('import', 'sale', 'damaged', 'return', 'adjustment');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'staff', 'customer');--> statement-breakpoint
CREATE TYPE "public"."water_need" AS ENUM('Low', 'Medium', 'High', 'Aquatic');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "monthly_expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" "expense_category" NOT NULL,
	"type" "expense_type" DEFAULT 'variable' NOT NULL,
	"status" "payment_status" DEFAULT 'paid' NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"expense_date" timestamp DEFAULT now() NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"batch_id" integer,
	"quantity" integer NOT NULL,
	"sale_price" numeric(10, 2) NOT NULL,
	"cost_price" numeric(10, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"total_price" numeric(10, 2) NOT NULL,
	"payment_method" varchar(50) DEFAULT 'cash' NOT NULL,
	"status" "order_status" DEFAULT 'pending',
	"order_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_batches" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"receipt_id" integer,
	"supplier_id" integer,
	"location_id" integer,
	"import_price" numeric(10, 2) NOT NULL,
	"original_quantity" integer NOT NULL,
	"remaining_quantity" integer NOT NULL,
	"unit" varchar(50),
	"notes" text,
	"batch_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"water_need" "water_need" DEFAULT 'Medium',
	"environment" "environment" DEFAULT 'Indoor',
	"plant_type" "plant_type" DEFAULT 'Leaf',
	"image_url" text,
	"category_id" integer,
	"current_price" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"min_price" numeric(10, 2) DEFAULT '0.00',
	"max_price" numeric(10, 2) DEFAULT '0.00',
	"status" "product_status" DEFAULT 'active',
	"pot_size" varchar(100),
	"height" varchar(100),
	"diameter" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "stock_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"batch_id" integer,
	"change_amount" integer NOT NULL,
	"reason" "stock_change_reason" NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20),
	"address" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(255),
	"email" varchar(255),
	"full_name" varchar(255),
	"avatar_url" text,
	"cover_url" text,
	"bio" text,
	"passwordHash" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'customer' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "warehouse_receipts" (
	"id" serial PRIMARY KEY NOT NULL,
	"receipt_code" varchar(50) NOT NULL,
	"supplier_id" integer,
	"shipping_cost" numeric(10, 2) DEFAULT '0.00',
	"labor_cost" numeric(10, 2) DEFAULT '0.00',
	"total_amount" numeric(10, 2) DEFAULT '0.00',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "warehouse_receipts_receipt_code_unique" UNIQUE("receipt_code")
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_batch_id_product_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."product_batches"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_batches" ADD CONSTRAINT "product_batches_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_batches" ADD CONSTRAINT "product_batches_receipt_id_warehouse_receipts_id_fk" FOREIGN KEY ("receipt_id") REFERENCES "public"."warehouse_receipts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_batches" ADD CONSTRAINT "product_batches_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_batches" ADD CONSTRAINT "product_batches_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_logs" ADD CONSTRAINT "stock_logs_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_logs" ADD CONSTRAINT "stock_logs_batch_id_product_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."product_batches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warehouse_receipts" ADD CONSTRAINT "warehouse_receipts_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE set null ON UPDATE no action;