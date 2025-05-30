export type UserRole = 'ADMIN' | 'LANDLORD' | 'REALTOR' | 'USER';

export type WaitingStatus = 'PENDING' | 'REJECTED' | 'ALLOWED';

export interface User {
  id: string;
  email: string;
  user_type: UserRole;
  created_at: string;
  waiting_status: WaitingStatus;
  documents?: {
    id: string;
    type: string;
    url: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
  }[];
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  user_id: string;
  images: string[];
} 