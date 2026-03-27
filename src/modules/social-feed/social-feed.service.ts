import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SocialFeedService {
  constructor(private prisma: PrismaService) {}

  async getPosts(tenantId: string) {
    return this.prisma.post.findMany({
      where: { tenantId },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
        reactions: true,
        comments: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createPost(tenantId: string, authorId: string, data: { content: string; imageUrl?: string }) {
    return this.prisma.post.create({
      data: {
        tenantId,
        authorId,
        content: data.content,
        imageUrl: data.imageUrl,
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
      },
    });
  }

  async updatePost(postId: string, tenantId: string, userId: string, userRole: string, data: { content?: string; imageUrl?: string; isPinned?: boolean }) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, tenantId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId && userRole !== 'admin' && userRole !== 'hr' && userRole !== 'manager' && userRole !== 'supervisor') {
      throw new ForbiddenException('You can only edit your own posts');
    }

    return this.prisma.post.update({
      where: { id: postId },
      data,
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, role: true },
        },
      },
    });
  }

  async deletePost(postId: string, tenantId: string, userId: string, userRole: string) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, tenantId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId && userRole !== 'admin' && userRole !== 'hr' && userRole !== 'manager' && userRole !== 'supervisor') {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.prisma.post.delete({ where: { id: postId } });
  }

  async addReaction(postId: string, tenantId: string, userId: string, type: string) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, tenantId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.prisma.postReaction.upsert({
      where: { postId_userId_type: { postId, userId, type } },
      create: { postId, userId, type },
      update: { type },
    });
  }

  async removeReaction(postId: string, userId: string, type: string) {
    return this.prisma.postReaction.deleteMany({
      where: { postId, userId, type },
    });
  }

  async addComment(postId: string, tenantId: string, userId: string, content: string) {
    const post = await this.prisma.post.findFirst({
      where: { id: postId, tenantId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.prisma.postComment.create({
      data: { postId, userId, content },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async deleteComment(commentId: string, tenantId: string, userId: string, userRole: string) {
    const comment = await this.prisma.postComment.findFirst({
      where: { id: commentId, post: { tenantId } },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== userId && userRole !== 'admin' && userRole !== 'hr' && userRole !== 'manager' && userRole !== 'supervisor') {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.postComment.delete({ where: { id: commentId } });
  }
}
