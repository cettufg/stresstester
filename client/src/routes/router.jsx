import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/home/home"
import Relatorios from "../pages/relatorios/Relatorios"

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/relatorios",
        element: <Relatorios />,
    },
])

export default router