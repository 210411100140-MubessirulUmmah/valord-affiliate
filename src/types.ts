export interface AffiliateSubmission {
  id?: string;
  fullName: string;
  accountName: string;
  contentLink: string;
  boostCode: string;
  submissionTimestamp: any; // Firestore Timestamp
  postDate: string; // Extracted or manually entered
  status: 'pending' | 'approved' | 'rejected';
  isSynced?: boolean;
}

export interface AffiliateRegistration {
  id?: string;
  fullName: string;
  accountTikTok: string;
  whatsappNumber: string;
  registrationTimestamp: any; // Firestore Timestamp
  status: 'pending' | 'reviewed' | 'qualified' | 'rejected';
  isSynced?: boolean;
}
