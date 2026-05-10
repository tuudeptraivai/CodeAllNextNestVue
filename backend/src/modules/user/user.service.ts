import { Injectable, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { Role } from './schemas/role.schema';
import { Permission } from './schemas/permission.schema';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService implements OnApplicationBootstrap {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Role.name) private roleModel: Model<Role>,
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    await this.seedAdmin();
  }

  async seedAdmin() {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');
    
    if (!adminEmail || !adminPassword) return;

    // Ensure roles exist (PermissionSeederService will sync permissions later)
    const adminRole = await this.roleModel.findOneAndUpdate(
      { name: 'admin' },
      { $setOnInsert: { name: 'admin', description: 'Administrator with full access' } },
      { upsert: true, new: true }
    );
    
    await this.roleModel.findOneAndUpdate(
      { name: 'user' },
      { $setOnInsert: { name: 'user', description: 'Regular user' } },
      { upsert: true }
    );

    const existingAdmin = await this.userModel.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const admin = new this.userModel({
        username: 'admin',
        email: adminEmail,
        password: hashedPassword,
        name: 'Administrator',
        role: adminRole._id,
      });
      await admin.save();
      console.log(`Admin account seeded: ${adminEmail}`);
    } else {
      await this.userModel.findByIdAndUpdate(existingAdmin._id, { role: adminRole._id });
    }
  }

  async assignRole(userId: string, roleId: string) {
    return this.userModel.findByIdAndUpdate(userId, { role: roleId }, { new: true }).exec();
  }

  async create(userData: any) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    let roleId = userData.role;
    if (!roleId) {
      const userRole = await this.roleModel.findOne({ name: 'user' });
      if (userRole) {
        roleId = userRole._id;
      }
    }

    const newUser = new this.userModel({
      ...userData,
      password: hashedPassword,
      role: roleId,
    });
    return newUser.save();
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string) {
    return this.userModel.findById(id).populate('collections.films').exec();
  }

  async findUserWithPermissions(id: string) {
    return this.userModel.findById(id)
      .populate({
        path: 'role',
        populate: {
          path: 'permissions'
        }
      })
      .exec();
  }

  async findAll() {
    return this.userModel.find().populate('role').exec();
  }

  async toggleFilmBookmark(userId: string, filmId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const index = user.favoriteFilms.indexOf(filmId as any);
    if (index > -1) {
      user.favoriteFilms.splice(index, 1);
    } else {
      user.favoriteFilms.push(filmId as any);
    }
    return user.save();
  }

  async toggleActorBookmark(userId: string, actorId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const index = user.favoriteActors.indexOf(actorId as any);
    if (index > -1) {
      user.favoriteActors.splice(index, 1);
    } else {
      user.favoriteActors.push(actorId as any);
    }
    return user.save();
  }

  async getBookmarks(userId: string) {
    const user = await this.userModel.findById(userId)
      .populate('favoriteFilms')
      .populate('favoriteActors')
      .populate('collections.films')
      .exec();
    if (!user) throw new NotFoundException('User not found');
    return {
      films: user.favoriteFilms,
      actors: user.favoriteActors,
      collections: user.collections,
    };
  }

  async createCollection(userId: string, name: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    
    if (!user.collections) user.collections = [];
    user.collections.push({ name, films: [] });
    await user.save();
    return this.findById(userId);
  }

  async addFilmToCollections(userId: string, filmId: string, collectionNames: string[]) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    user.collections.forEach(col => {
      const filmIndex = col.films.map(f => f.toString()).indexOf(filmId);
      
      if (collectionNames.includes(col.name)) {
        if (filmIndex === -1) {
          col.films.push(filmId as any);
        }
      } else {
        if (filmIndex > -1) {
          col.films.splice(filmIndex, 1);
        }
      }
    });

    await user.save();
    return this.findById(userId);
  }

  async removeFilmFromCollection(userId: string, filmId: string, collectionName: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    user.collections.forEach(col => {
      if (col.name === collectionName) {
        const index = col.films.map(f => f.toString()).indexOf(filmId);
        if (index > -1) {
          col.films.splice(index, 1);
        }
      }
    });

    await user.save();
    return this.findById(userId);
  }

  async updateWatchHistory(userId: string, data: { filmId: string, filmTitle: string, thumbnail: string, episodeSlug: string, episodeName: string, currentTime: number, duration: number }) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (!user.watchHistory) user.watchHistory = [];

    const index = user.watchHistory.findIndex(h => h.film && h.film.toString() === data.filmId);
    if (index > -1) {
      user.watchHistory[index].filmTitle = data.filmTitle;
      user.watchHistory[index].thumbnail = data.thumbnail;
      user.watchHistory[index].episodeSlug = data.episodeSlug;
      user.watchHistory[index].episodeName = data.episodeName;
      user.watchHistory[index].currentTime = data.currentTime;
      user.watchHistory[index].duration = data.duration;
      user.watchHistory[index].updatedAt = new Date();
    } else {
      user.watchHistory.unshift({
        film: data.filmId as any,
        filmTitle: data.filmTitle,
        thumbnail: data.thumbnail,
        episodeSlug: data.episodeSlug,
        episodeName: data.episodeName,
        currentTime: data.currentTime,
        duration: data.duration,
        updatedAt: new Date()
      } as any);
    }

    // Keep only last 50 items
    if (user.watchHistory.length > 50) {
      user.watchHistory = user.watchHistory.slice(0, 50);
    }

    await user.save();
    return this.findById(userId);
  }

  async getWatchHistory(userId: string) {
    const user = await this.userModel.findById(userId)
      .populate('watchHistory.film')
      .exec();
    if (!user) throw new NotFoundException('User not found');

    return user.watchHistory
      .filter(item => item && (item.film || item.filmTitle)) // Only return valid items
      .sort((a, b) => {
        const dateA = a.updatedAt instanceof Date ? a.updatedAt.getTime() : new Date(a.updatedAt).getTime();
        const dateB = b.updatedAt instanceof Date ? b.updatedAt.getTime() : new Date(b.updatedAt).getTime();
        return dateB - dateA;
      })
      .map(item => {
        const filmObj = item.film as any;
        return {
          id: filmObj?._id || item.film || '',
          filmName: item.filmTitle || filmObj?.title || 'Phim không tên',
          filmSlug: filmObj?.slug || '',
          thumbnail: item.thumbnail || filmObj?.thumb_url || filmObj?.poster_url || '',
          episodeName: item.episodeName,
          episodeSlug: item.episodeSlug,
          watchTime: item.currentTime,
          duration: item.duration || 0,
          updatedAt: item.updatedAt
        };
      });
  }

  async removeWatchHistory(userId: string, filmId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (!user.watchHistory) return user;

    user.watchHistory = user.watchHistory.filter(h => h.film && h.film.toString() !== filmId);
    return user.save();
  }

  async updateProfile(userId: string, data: any) {
    return this.userModel.findByIdAndUpdate(userId, data, { new: true }).populate('collections.films').exec();
  }

  async updateAvatar(userId: string, avatarUrl: string) {
    return this.userModel.findByIdAndUpdate(userId, { avatar: avatarUrl }, { new: true }).exec();
  }

  async changePassword(userId: string, data: any) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(data.oldPassword, user.password);
    if (!isMatch) throw new NotFoundException('Old password does not match');

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    user.password = hashedPassword;
    return user.save();
  }
}
