import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema'; // Import cùng thư mục nên để thế này là đúng

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

// Ngăn việc tạo quá nhiều kết nối trong quá trình Hot Reload ở môi trường Dev
const globalForDrizzle = globalThis as unknown as {
  client: postgres.Sql | undefined;
};

const client = globalForDrizzle.client ?? postgres(connectionString, { 
  max: process.env.NODE_ENV === 'production' ? undefined : 1,
  idle_timeout: 1,
  connect_timeout: 5, // Giảm xuống 5s để ứng dụng phản hồi nhanh khi DB chết
  onnotice: (notice) => console.log("DB Notice:", notice.message),
});

if (process.env.NODE_ENV !== 'production') globalForDrizzle.client = client;

export const db = drizzle(client, { schema });