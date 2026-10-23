export * from "./Category.entity";
import { Category } from "./Category.entity";
(Category as any).default = Category;
// @ts-ignore
if (typeof module !== "undefined" && module.exports) {
  // @ts-ignore
  module.exports = Category;
}
export default Category;
