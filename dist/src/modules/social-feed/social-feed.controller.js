"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialFeedController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const social_feed_service_1 = require("./social-feed.service");
let SocialFeedController = class SocialFeedController {
    socialFeedService;
    constructor(socialFeedService) {
        this.socialFeedService = socialFeedService;
    }
    async getPosts(req) {
        return this.socialFeedService.getPosts(req.user.tenantId);
    }
    async createPost(req, body) {
        return this.socialFeedService.createPost(req.user.tenantId, req.user.id, body);
    }
    async updatePost(req, id, body) {
        return this.socialFeedService.updatePost(id, req.user.tenantId, req.user.id, req.user.role, body);
    }
    async deletePost(req, id) {
        return this.socialFeedService.deletePost(id, req.user.tenantId, req.user.id, req.user.role);
    }
    async addReaction(req, id, body) {
        return this.socialFeedService.addReaction(id, req.user.tenantId, req.user.id, body.type);
    }
    async removeReaction(req, id, body) {
        return this.socialFeedService.removeReaction(id, req.user.id, body.type);
    }
    async addComment(req, id, body) {
        return this.socialFeedService.addComment(id, req.user.tenantId, req.user.id, body.content);
    }
    async deleteComment(req, id) {
        return this.socialFeedService.deleteComment(id, req.user.tenantId, req.user.id, req.user.role);
    }
};
exports.SocialFeedController = SocialFeedController;
__decorate([
    (0, common_1.Get)('posts'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SocialFeedController.prototype, "getPosts", null);
__decorate([
    (0, common_1.Post)('posts'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SocialFeedController.prototype, "createPost", null);
__decorate([
    (0, common_1.Put)('posts/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], SocialFeedController.prototype, "updatePost", null);
__decorate([
    (0, common_1.Delete)('posts/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SocialFeedController.prototype, "deletePost", null);
__decorate([
    (0, common_1.Post)('posts/:id/reactions'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], SocialFeedController.prototype, "addReaction", null);
__decorate([
    (0, common_1.Delete)('posts/:id/reactions'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], SocialFeedController.prototype, "removeReaction", null);
__decorate([
    (0, common_1.Post)('posts/:id/comments'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], SocialFeedController.prototype, "addComment", null);
__decorate([
    (0, common_1.Delete)('comments/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SocialFeedController.prototype, "deleteComment", null);
exports.SocialFeedController = SocialFeedController = __decorate([
    (0, common_1.Controller)('social-feed'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [social_feed_service_1.SocialFeedService])
], SocialFeedController);
//# sourceMappingURL=social-feed.controller.js.map