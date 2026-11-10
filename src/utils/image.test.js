import { readOptimizedImage } from './image';

test('compresses a selected image to a JSON-server compatible data URL', async () => {
  const context = {
    fillRect: jest.fn(),
    drawImage: jest.fn(),
    fillStyle: '',
  };
  const canvas = {
    width: 0,
    height: 0,
    getContext: jest.fn(() => context),
    toDataURL: jest.fn((type, quality) => (
      quality > 0.75 ? `data:image/jpeg;base64,${'x'.repeat(80 * 1024)}` : 'data:image/jpeg;base64,small'
    )),
  };
  const originalCreateElement = document.createElement.bind(document);
  jest.spyOn(document, 'createElement').mockImplementation((tagName, ...args) => (
    tagName === 'canvas' ? canvas : originalCreateElement(tagName, ...args)
  ));

  global.FileReader = class {
    readAsDataURL() {
      this.result = 'data:image/png;base64,source';
      this.onload();
    }
  };
  global.Image = class {
    naturalWidth = 2400;
    naturalHeight = 1600;

    set src(source) {
      if (source) this.onload();
    }
  };

  await expect(readOptimizedImage(new File(['image'], 'cake.png', { type: 'image/png' })))
    .resolves.toBe('data:image/jpeg;base64,small');
  expect(canvas.width).toBe(1200);
  expect(canvas.toDataURL).toHaveBeenCalledWith('image/jpeg', expect.any(Number));
});

test('rejects non-image and oversized source files', async () => {
  await expect(readOptimizedImage(new File(['text'], 'note.txt', { type: 'text/plain' })))
    .rejects.toThrow('Vui lòng chọn tệp hình ảnh hợp lệ.');
  await expect(readOptimizedImage({
    type: 'image/png',
    size: 2 * 1024 * 1024 + 1,
  })).rejects.toThrow('Ảnh cần nhỏ hơn 2MB.');
});
