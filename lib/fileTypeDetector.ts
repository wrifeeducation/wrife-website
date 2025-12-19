export function detectFileCategory(filename: string): string {
  const lowerFilename = filename.toLowerCase();
  
  if (lowerFilename.includes('worksheet') && lowerFilename.includes('challenge')) {
    return 'worksheet_challenge';
  }
  if (lowerFilename.includes('worksheet') && lowerFilename.includes('support')) {
    return 'worksheet_support';
  }
  if (lowerFilename.includes('worksheet') && lowerFilename.includes('core')) {
    return 'worksheet_core';
  }
  if (lowerFilename.includes('worksheet')) {
    return 'worksheet_core';
  }
  
  if (lowerFilename.includes('presentation')) {
    return 'presentation';
  }
  
  if (lowerFilename.includes('assessment')) {
    return 'assessment';
  }
  
  if (lowerFilename.includes('progress') && lowerFilename.includes('tracker')) {
    return 'progress_tracker';
  }
  if (lowerFilename.includes('progress_tracker')) {
    return 'progress_tracker';
  }
  
  if (lowerFilename.includes('teacher') && lowerFilename.includes('guide')) {
    return 'teacher_guide';
  }
  if (lowerFilename.includes('teaching') && lowerFilename.includes('guide')) {
    return 'teacher_guide';
  }
  
  if (lowerFilename.endsWith('.html') || lowerFilename.endsWith('.htm')) {
    return 'interactive_practice';
  }
  
  return 'teacher_guide';
}

export function getFileExtension(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop() || '';
  const typeMap: Record<string, string> = {
    'pdf': 'pdf',
    'docx': 'docx',
    'doc': 'docx',
    'xlsx': 'xlsx',
    'xls': 'xlsx',
    'html': 'html',
    'htm': 'html',
    'pptx': 'pptx',
    'ppt': 'pptx',
  };
  return typeMap[ext] || ext;
}
