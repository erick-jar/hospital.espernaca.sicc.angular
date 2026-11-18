export type CelulaCsv = string | number | boolean | null | undefined;

export function gerarCsv(linhas: readonly (readonly CelulaCsv[])[]): string {
  const conteudo = linhas.map((linha) => linha.map(serializarCelula).join(';')).join('\r\n');

  return `\uFEFF${conteudo}\r\n`;
}

export function baixarCsv(documento: Document, conteudo: string, nomeArquivo: string): boolean {
  const janela = documento.defaultView;
  const gerenciadorUrl = janela?.URL;

  if (!janela || typeof gerenciadorUrl?.createObjectURL !== 'function') {
    return false;
  }

  let urlArquivo: string | undefined;
  let linkDownload: HTMLAnchorElement | undefined;

  try {
    const arquivo = new janela.Blob([conteudo], { type: 'text/csv;charset=utf-8' });
    urlArquivo = gerenciadorUrl.createObjectURL(arquivo);
    linkDownload = documento.createElement('a');

    linkDownload.href = urlArquivo;
    linkDownload.download = nomeArquivo;
    linkDownload.hidden = true;
    documento.body.append(linkDownload);
    linkDownload.click();
    linkDownload.remove();

    janela.setTimeout(() => revogarUrl(gerenciadorUrl, urlArquivo), 0);

    return true;
  } catch {
    linkDownload?.remove();
    revogarUrl(gerenciadorUrl, urlArquivo);

    return false;
  }
}

function serializarCelula(valor: CelulaCsv): string {
  if (valor === null || valor === undefined) {
    return '';
  }

  if (typeof valor !== 'string') {
    return String(valor);
  }

  let texto = valor;

  if (/^\s*[=+\-@]/.test(texto)) {
    texto = `'${texto}`;
  }

  const exigeAspas = /[;"\r\n]/.test(texto) || texto.trim() !== texto;

  return exigeAspas ? `"${texto.replaceAll('"', '""')}"` : texto;
}

function revogarUrl(gerenciadorUrl: typeof URL, urlArquivo: string | undefined): void {
  if (!urlArquivo) {
    return;
  }

  try {
    gerenciadorUrl.revokeObjectURL(urlArquivo);
  } catch {
    // O download já foi iniciado; uma falha de limpeza não deve interromper a interface.
  }
}
