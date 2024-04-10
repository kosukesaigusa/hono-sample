import { Hono } from 'hono'
import { renderer } from './renderer'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use(renderer)

app.get('/', (c) => {
  return c.render(<h1>Hello!</h1>)
})

app.get('/hello', (c) => {
  return c.json({ message: 'Hello!' })
})

app.get('/customers', async (c) => {
  const result = await c.env.DB.prepare(`SELECT * FROM Customers`).all()
  return c.json({ customers: result.results })
})

app.get('/customers/:customerId', async (c) => {
  const { customerId } = c.req.param()
  const customer = await c.env.DB.prepare(
    `SELECT * FROM Customers WHERE CustomerId = ?`
  )
    .bind(customerId)
    .first()
  return c.json({ customer })
})

app.post('/customers', async (c) => {
  const body = await c.req.json()
  const companyName = body.companyName as string
  const contactName = body.contactName as string

  await c.env.DB.prepare(
    `INSERT INTO Customers (CompanyName, ContactName) VALUES (?, ?)`
  )
    .bind(companyName, contactName)
    .run()

  return c.json({ message: 'created' })
})

export default app
