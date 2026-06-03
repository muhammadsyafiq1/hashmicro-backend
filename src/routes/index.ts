import { Router } from "express";
import { productController } from "../controllers/ProductController";
import { categoryController } from "../controllers/CategoryController";
import { stringCheckerController } from "../controllers/StringCheckerController";
import { authController } from "../controllers/AuthController";
import { strictLimiter } from "../middlewares/rateLimiter";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.post("/auth/login",    (req, res) => authController.login(req, res));
router.post("/auth/register", (req, res) => authController.register(req, res));
router.get("/auth/me",        authenticate, (req, res) => authController.me(req as any, res));

router.get("/products",          authenticate, (req, res) => productController.index(req, res));
router.get("/products/:id",      authenticate, (req, res) => productController.show(req, res));
router.post("/products",         authenticate, (req, res) => productController.store(req, res));
router.put("/products/:id",      authenticate, (req, res) => productController.update(req, res));
router.delete("/products/:id",   authenticate, (req, res) => productController.destroy(req, res));

router.get("/categories",        authenticate, (req, res) => categoryController.index(req, res));
router.post("/categories",       authenticate, (req, res) => categoryController.store(req, res));
router.put("/categories/:id",    authenticate, (req, res) => categoryController.update(req, res));
router.delete("/categories/:id", authenticate, (req, res) => categoryController.destroy(req, res));

router.post("/string-checker", strictLimiter, authenticate, (req, res) =>
  stringCheckerController.check(req, res)
);

export default router;