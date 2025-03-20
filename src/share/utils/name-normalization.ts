export function normalizeFullName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replaceAll(' ', '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}
