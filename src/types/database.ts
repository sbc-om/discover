export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  roleId: string;
  roleName?: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  preferredLanguage: 'en' | 'ar';
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: string;
  nameAr: string;
  nameEn: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Module {
  id: string;
  name: string;
  nameAr: string;
  nameEn: string;
  icon?: string;
  route?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  nameAr: string;
  nameEn: string;
  moduleId: string;
  action: 'create' | 'read' | 'update' | 'delete';
  createdAt: Date;
  updatedAt: Date;
}

export interface Academy {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Program {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  academyId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthTest {
  id: string;
  userId: string;
  testDate: Date;
  height?: number;
  weight?: number;
  bloodPressure?: string;
  heartRate?: number;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedalRequest {
  id: string;
  userId: string;
  medalType: string;
  achievementDescription?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedDate: Date;
  reviewedBy?: string;
  reviewDate?: Date;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  subject?: string;
  content: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppMessage {
  id: string;
  userId: string;
  phoneNumber: string;
  messageContent: string;
  messageType: 'text' | 'image' | 'document';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  sentAt: Date;
  createdAt: Date;
}
