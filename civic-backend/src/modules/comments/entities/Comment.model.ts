export * from "./Comment.entity";
import { Comment } from "./Comment.entity";
(Comment as any).default = Comment;
// @ts-ignore
if (typeof module !== "undefined" && module.exports) {
  // @ts-ignore
  module.exports = Comment;
}
export default Comment;
