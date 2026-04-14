export interface AffiliateSubmission {
  id?: string;
  accountName: string;
  contentLink: string;
  boostCode: string;
  submissionTimestamp: any; // Firestore Timestamp
  postDate: string; // Extracted or manually entered
  status: 'pending' | 'approved' | 'rejected';
}
