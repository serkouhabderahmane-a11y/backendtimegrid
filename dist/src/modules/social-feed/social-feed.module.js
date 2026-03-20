"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialFeedModule = void 0;
const common_1 = require("@nestjs/common");
const social_feed_controller_1 = require("./social-feed.controller");
const social_feed_service_1 = require("./social-feed.service");
const prisma_service_1 = require("../prisma.service");
let SocialFeedModule = class SocialFeedModule {
};
exports.SocialFeedModule = SocialFeedModule;
exports.SocialFeedModule = SocialFeedModule = __decorate([
    (0, common_1.Module)({
        controllers: [social_feed_controller_1.SocialFeedController],
        providers: [social_feed_service_1.SocialFeedService, prisma_service_1.PrismaService],
        exports: [social_feed_service_1.SocialFeedService],
    })
], SocialFeedModule);
//# sourceMappingURL=social-feed.module.js.map