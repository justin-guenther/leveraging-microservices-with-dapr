import mysql, { Pool, QueryError, FieldPacket } from 'mysql2';

export class Database {
    private pool: Pool;

    constructor() {
        this.pool = mysql.createPool({
            host: process.env.DB_HOSTNAME,
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        });

        // Handling connection errors
        this.pool.getConnection((err, connection) => {
            if (err) {
                console.error('Error connecting to MySQL:', err);
                // You may choose to throw an error here or handle it differently
            } else {
                console.log('Connected to MySQL server');
                connection.release(); // Release the connection back to the pool
            }
        });
    }

    Query<T>(sql: string, values?: any[]): Promise<T[]> {
        return new Promise((resolve, reject) => {
            this.pool.query(sql, values, (error: QueryError | null, results: any, fields: FieldPacket[]) => {
                if (error) {
                    reject(error);
                } else {
                    if (Array.isArray(results)) {
                        // Case when results are of type T[]
                        const typedResults = results as T[];
                        resolve(typedResults);
                    } else {
                        // Case when results are of type ResultSetHeader
                        resolve(results); // Placeholder, adjust as needed
                    }
                }
            });
        });
    }
}
