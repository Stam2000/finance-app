import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

export const sql = neon("postgresql://finance_owner:V5EHXAkLs6au@ep-hidden-poetry-a59ri0wt.us-east-2.aws.neon.tech/finance?sslmode=require");
export const db = drizzle(sql);


