import express from "express"
import 'dotenv/config'
import router from "./routes/routes"

const app = express()
const PORT = process.env.PORT ?? 3000

app.use(express.json());
app.use("/api/v1", router);

try {
    app.listen(PORT, () => {
        console.log(`Server is running on the ${PORT}`)
    })
}
catch {
    console.log(`Unable to start the server`)
    process.exit(1)
}
