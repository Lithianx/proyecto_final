import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FiltroPalabraService {
private palabrasVetadas = [

  // Vulgares/insultos comunes
  'mierda', 'imbécil', 'idiota', 'estúpido', 'tarado', 'retrasado', 'inútil',
  'tonto', 'baboso', 'pelotudo', 'boludo', 'forro', 'culiao', 'culiá', 'culiado',
  'weon', 'weona', 'huevon', 'huevona', 'maricón', 'maricona', 'maraca',
  'puta', 'puto', 'perra', 'zorra', 'perkin', 'longi', 'saco wea', 'saco de wea',
  'saco e wea', 'pajero', 'chanta', 'ñeri', 'gorreado', 'guarén', 'penca',

  // Racismo / xenofobia
  'negro de mierda', 'sudaca', 'chino de mierda', 'indio culiao', 'gringo conchetumadre',
  'judío de mierda', 'moro de mierda', 'flayte', 'roto', 'resentido',

  // Discriminación / capacitismo
  'mongólico', 'subnormal', 'down', 'lisiado', 'minusválido', 'anormal', 'cojo',
  'paralítico', 'autista', 'deforme', 'mutante',

  // Acoso / amenazas
  'te mato', 'te voy a matar', 'ojalá te mueras', 'muerete', 'muérete',
  'desaparece', 'te voy a pegar', 'te voy a golpear', 'te voy a violar',
  'nadie te quiere', 'todos te odian', 'vales callampa',

  // Sexuales / contenido explícito
  'sexo', 'pene', 'vagina', 'verga', 'pico', 'pichula', 'raja', 'culo',
  'tula', 'mamada', 'chuparla', 'chúpala', 'chupame', 'conchetumadre',
  'concha tu madre', 'ctm', 'ctmre', 'tetas', 'tetona', 'poronga', 'coger',
  'follar', 'tirar', 'tragar', 'orgasmo', 'masturbar', 'pornografía',
  'porno', 'nudes', 'caliente', 'rica', 'anal', 'penetrar', 'eyacular',
  'sado', 'sadomaso', 'bdsm', '69', 'sexo oral',

  // Venta ilegal / explotación
  'vendo droga', 'vendo armas', 'sexo por dinero', 'prostituta', 'prostitución',
  'putero', 'burdel', 'escort', 'camgirl', 'niños desnudos', 'pedo', 'zoofilia',
  'necrofilia', 'abuso sexual', 'tráfico humano', 'porn infantil',

  // Drogas / consumo ilegal
  'marihuana', 'weed', 'porro', 'cocaína', 'cocaina', 'pasta base', 'fumar pasta',
  'heroína', 'heroina', 'lsd', 'xtc', 'éxtasis', 'mdma', 'droga', 'dealer',
  'fumarse un porro', 'pastillas', 'jalar', 'pasarse un pase', 'molly',

  // Inglés ofensivo
  'fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'nude', 'porn',
  'blowjob', 'suck', 'cum', 'fucking', 'naked', 'rape',

  // Otras expresiones chilenas y latinas fuertes
  'conchetumare', 'conchetumadre', 'la raja', 'sopla nucas', 'leche', 'sacowea',
  'pico pal que lee', 'anda a laar', 'chúpala voh', 'te vo a romper el hocico',
  'hijo de puta', 'hija de puta', 'caga', 'cagón', 'cagona', 'mal nacido',
  'hueá', 'hueá culia', 'culiá', 'culia', 'chupalo', 'chúpalo', 'maraco', 'come callampa'

];

  private equivalencias: { [key: string]: string[] } = {
    'a': ['4', '@', 'á', 'à', 'â', 'ä', 'ã'],
    'b': ['8', 'ß'],
    'c': ['(', '{', '[', '<', 'ç'],
    'd': ['|)', 'cl'],
    'e': ['3', '€', 'é', 'è'],
    'f': ['ph'],
    'g': ['6', '9'],
    'h': ['#', '|-|'],
    'i': ['1', '!', '|', 'í'],
    'k': ['|<'],
    'l': ['1', '|'],
    'm': ['|\\/|', '(v)', '^^'],
    'n': ['ñ', '/\\/'],
    'o': ['0', 'ó'],
    's': ['5', '$'],
    't': ['7', '+'],
    'u': ['ú', 'ù', 'ü', 'v'],
    'v': ['\\/'],
    'w': ['vv', '\\/\\/'],
    'x': ['×', '><'],
    'y': ['¥'],
    'z': ['2']
  };

  // Escapa caracteres especiales para RegExp
  private escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Normaliza variantes y elimina símbolos
  private normalizar(texto: string): string {
    let resultado = texto.toLowerCase();
    for (const letra in this.equivalencias) {
      this.equivalencias[letra].forEach(eq => {
        const safeEq = this.escapeRegExp(eq);
        resultado = resultado.replace(new RegExp(safeEq, 'g'), letra);
      });
    }
    return resultado;
  }

  // Elimina separaciones falsas (espacios y símbolos entre letras)
  private unirCaracteresSeparados(texto: string): string {
    return texto.replace(/[^a-z0-9]+/g, '');
  }

  contienePalabraVetada(texto: string): boolean {
    const textoNormal = this.normalizar(texto);
    const textoUnido = this.unirCaracteresSeparados(textoNormal);

    return this.palabrasVetadas.some(palabra => {
      const palabraNorm = this.unirCaracteresSeparados(this.normalizar(palabra));
      return textoUnido.includes(palabraNorm);
    });
  }
}