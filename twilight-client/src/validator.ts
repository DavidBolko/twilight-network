export function validateRegistrationInput(name: string, email: string, password: string, password2: string): string | null {
  let err: string | null;

  if ((err = validateName(name)) != null) return err;
  if ((err = validateEmail(email)) != null) return err;
  if ((err = validatePassword(password)) != null) return err;

  if (password !== password2) return "Passwords do not match.";
  return null;
}

export function validateLoginInput(email: string, password: string): string | null {
  let err: string | null;

  if ((err = validateEmail(email)) != null) return err;
  if ((err = validatePassword(password)) != null) return err;

  return null;
}

export function validateComment(comment: string): string | null {
  const c = comment ?? "";
  if (c.trim().length === 0) return "Comment cannot be empty.";

  const maxLen = 500;
  if (c.length > maxLen) return `Comment is too long. Max ${maxLen} characters.`;

  if (containsHtml(c)) return "Comment cannot contain HTML tags.";
  return null;
}

export function validateDescription(desc: string): string | null {
  const d = desc ?? "";
  if (d.trim().length === 0) return "Description cannot be empty.";
  if (d.length < 10 || d.length > 300) return "Description must be between 10 and 300 characters.";
  if (containsHtml(d)) return "Description cannot contain HTML tags.";
  return null;
}

export function validateCommunityClient(name: string, description: string, image?: File): string | null {
  let err: string | null;

  if ((err = validateName(name)) != null) return err;
  if ((err = validateDescription(description)) != null) return err;

  if ((err = validateImageFile(image, 25, true)) != null) return err;

  return null;
}

export function validateAvatarFile(file: File): string | null {
  return validateImageFile(file, 5, false);
}

export function validatePostClient(text: string, images: File[]) {
  const hasText = text?.trim().length > 0;
  const hasImages = images && images.length > 0;

  if (!hasText && !hasImages) return "Post cannot be empty.";
  if (text && text.length > 2000) return "Post text is too long. Max 2000 characters.";
  if (/<[a-z][\s\S]*>/i.test(text ?? "")) return "Post text cannot contain HTML tags.";

  if (hasImages) {
    if (images.length > 10) return "You can upload a maximum of 10 images.";
    for (const f of images) {
      if (!f.type.startsWith("image/")) return "Only image files are allowed.";
      // voliteľne: limit 5MB (ak máš na backende)
      if (f.size > 5 * 1024 * 1024) return "Each image must be <= 5MB.";
    }
  }
  return null;
}

export function containsHtml(text: string) {
  return /<[^>]+>/.test(text ?? "");
}

function validateName(name: string): string | null {
  const n = (name ?? "").trim();
  if (isBlank(n)) return "Name cannot be empty.";
  if (n.length < 3 || n.length > 30) return "Name must be between 3 and 30 characters.";
  if (!/^[A-Za-z0-9 _-]+$/.test(n)) return "Name contains invalid characters.";
  return null;
}

function validateTitle(title: string): string | null {
  const t = (title ?? "").trim();
  if (isBlank(t)) return "Title cannot be empty.";
  if (t.length < 3 || t.length > 100) return "Title must be between 3 and 100 characters.";
  return null;
}

function validateEmail(email: string): string | null {
  const e = (email ?? "").trim();
  if (isBlank(e)) return "Email cannot be empty.";
  if (!/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/.test(e)) return "Invalid email format.";
  return null;
}

function validatePassword(password: string): string | null {
  if (isBlank(password)) return "Password cannot be empty.";
  if (password.length < 6) return "Password must be at least 6 characters long.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number.";
  return null;
}

function validateImageFile(file: File | undefined, maxMb: number, optional: boolean): string | null {
  if (!file) return optional ? null : "No file selected.";
  if (!file.type.startsWith("image/")) return "Invalid image format. Only image files are allowed.";

  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) return `Image size exceeds ${maxMb} MB.`;

  return null;
}

function isBlank(str: string) {
  return !str || str.trim().length === 0;
}
