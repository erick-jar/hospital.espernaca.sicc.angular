import { baixarCsv, gerarCsv } from './dashboard-csv';

describe('Dashboard CSV', () => {
  const createObjectUrlDescriptor = Object.getOwnPropertyDescriptor(window.URL, 'createObjectURL');
  const revokeObjectUrlDescriptor = Object.getOwnPropertyDescriptor(window.URL, 'revokeObjectURL');

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    restaurarPropriedadeUrl('createObjectURL', createObjectUrlDescriptor);
    restaurarPropriedadeUrl('revokeObjectURL', revokeObjectUrlDescriptor);
  });

  it('should generate an Excel-compatible UTF-8 CSV', () => {
    const csv = gerarCsv([
      ['Nome', 'Observação', 'Quantidade'],
      ['Ana; Lima', 'Disse "olá"\ne saiu', 2],
      ['=HYPERLINK("https://example.com")', null, -1],
      ['  +SUM(1;1)', undefined, true],
    ]);

    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv.endsWith('\r\n')).toBe(true);
    expect(csv).toContain('"Ana; Lima";"Disse ""olá""\ne saiu";2');
    expect(csv).toContain('"\'=HYPERLINK(""https://example.com"")";;-1');
    expect(csv).toContain('"\'  +SUM(1;1)";;true');
  });

  it('should download the generated CSV and release its temporary URL', () => {
    vi.useFakeTimers();

    const createObjectUrl = vi.fn(() => 'blob:dashboard');
    const revokeObjectUrl = vi.fn();
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    Object.defineProperty(window.URL, 'createObjectURL', {
      configurable: true,
      value: createObjectUrl,
    });
    Object.defineProperty(window.URL, 'revokeObjectURL', {
      configurable: true,
      value: revokeObjectUrl,
    });

    expect(baixarCsv(document, gerarCsv([['Dashboard']]), 'dashboard.csv')).toBe(true);
    expect(createObjectUrl).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    expect(document.querySelector('a[download="dashboard.csv"]')).toBeNull();

    vi.runAllTimers();
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:dashboard');
  });

  it('should fail gracefully when the browser does not support object URLs', () => {
    Object.defineProperty(window.URL, 'createObjectURL', {
      configurable: true,
      value: undefined,
    });

    expect(baixarCsv(document, gerarCsv([['Dashboard']]), 'dashboard.csv')).toBe(false);
  });
});

function restaurarPropriedadeUrl(
  propriedade: 'createObjectURL' | 'revokeObjectURL',
  descriptor: PropertyDescriptor | undefined,
): void {
  if (descriptor) {
    Object.defineProperty(window.URL, propriedade, descriptor);
    return;
  }

  Reflect.deleteProperty(window.URL, propriedade);
}
