export interface CourseThumbnail {
  url: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
}

export interface CourseResource {
  id: number;
  title: string;
  slug: string;
  thumbnail: CourseThumbnail | string;
  price: number;
  createdAt: string;
  status: string;
  publishedAt: string | null;

  tags: TagResource[];

  instructor: InstructorResource;

  modules: ModuleResource[];
}

export interface TagResource {
  id: number;
  name: string;
}

export interface InstructorResource {
  id: number;
  name: string;
  email: string;
}

export interface ModuleResource {
  id: number;
  name: string;
  lessons: LessonResource[];
}

export interface LessonResource {
  id: number;
  name: string;
  videoUrls: string[];
  resources: LessonResourceItem[];
}

export interface LessonResourceItem {
  id: number;
  name: string;
  url: string;
}

export interface CourseCollectionResource {
  data: CourseResource[];
}