export interface EventPayload {
    context: string;
    data: any;
    dataFormatVersion: number;
    dataId: string;
    source: string;
    type: string;
  }

  export interface CategoryItemData {
    context: string;
    data: {
      items: string[];
      key: string;
      recipientEmails: string[];
    };
    dataFormatVersion: number;
    dataId: string;
    groupId: string;
    notes: string;
    source: string;
    type: string;
  }
  
  export interface ClassificationNode {
    MetaData: any;
    Name: string;
    Classification?: Record<string, ClassificationNode>;
  }
  
  export type PayloadType = 'Created' | 'Updated' | 'Deleted';