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
  'necrofilia', 'abuso sexual', 'tráfico humano', 'porn infantil', 'yoLost', 'yoLos', 'aca manito',
  'aca los', 'kien los', 'quien los dely', 'kien lost', 'dely', 'manito fina', 'aca los fino', 'kn mano',
  'kn manito de', 'aca lost fino', 'aka lost finoly', 'aqui los', 'aki los', 'aki los',

  // Drogas / consumo ilegal
  'marihuana', 'weed', 'porro', 'cocaína', 'cocaina', 'pasta base', 'fumar pasta',
  'heroína', 'heroina', 'lsd', 'xtc', 'éxtasis', 'mdma', 'droga', 'dealer',
  'fumarse un porro', 'pastillas', 'pastis', 'jalar', 'pasarse un pase', 'molly', 'fumar mota',
  'fumar', 'tomar pastis', 'hielito', 'yelito', 'crack', 'paco', 'pasta base de cocaína', 'drogas duras',
  'drogas blandas', 'drogadicto', 'adicto a las drogas', 'adicción', 'rehabilitación de drogas',
  'rehab', 'drogas ilegales', 'tráfico de drogas', 'narco', 'narcomenudeo', 

  

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

  // Detecta patrones de evasión intencional
  private detectarPatronEvasion(palabraOriginal: string, palabraVetadaUnida: string): boolean {
    const textoOriginal = palabraOriginal.toLowerCase();
    
    // Patrón 1: Espacios entre letras (ej: "i n s u l t o")
    const conEspacios = textoOriginal.replace(/\s+/g, '');
    if (conEspacios.length > 0 && this.unirCaracteresSeparados(conEspacios) === palabraVetadaUnida) {
      return true;
    }
    
    // Patrón 2: Símbolos intercalados (ej: "p-u-t-a", "p*u*t*a", "G,o,RdAs")
    const conSimbolos = textoOriginal.replace(/[^a-z0-9]/g, '');
    if (conSimbolos.toLowerCase() === palabraVetadaUnida) {
      // Verificar que haya símbolos intercalados
      const caracteresNoAlfanum = textoOriginal.replace(/[a-z0-9]/g, '').length;
      return caracteresNoAlfanum >= 2;
    }
    
    // Patrón 3: Letras separadas por comas/puntos (ej: "G,o,RdAs", "p.u.t.a")
    const textoSinSeparadores = textoOriginal.replace(/[,.\-_|/\\*+=#@!$%^&(){}[\]<>?;:'"~`]/g, '');
    if (textoSinSeparadores.toLowerCase() === palabraVetadaUnida) {
      // Verificar que tenga suficientes separadores
      const separadores = textoOriginal.match(/[,.\-_|/\\*+=#@!$%^&(){}[\]<>?;:'"~`]/g);
      return separadores && separadores.length >= 2;
    }
    
    // Patrón 4: Prefijos/sufijos obvios (ej: "xxputaxx", "123puta456")
    const textoSinNumeros = textoOriginal.replace(/[0-9]/g, '');
    const textoSinX = textoOriginal.replace(/x+/g, '');
    
    if (textoSinNumeros.includes(palabraVetadaUnida) || textoSinX.includes(palabraVetadaUnida)) {
      // Verificar que no sea una palabra normal que contenga la vetada
      const longitudExtra = textoOriginal.length - palabraVetadaUnida.length;
      return longitudExtra <= 6; // Máximo 6 caracteres extra (3 antes + 3 después)
    }
    
    return false;
  }

  contienePalabraVetada(texto: string): boolean {
    const textoNormal = this.normalizar(texto);
    
    // Dividir el texto en palabras individuales
    const palabrasTexto = textoNormal.split(/\s+/);
    
    // 1. Verificar patrones de evasión en el texto completo (sin dividir por espacios)
    const textoCompletoSinEspacios = textoNormal.replace(/\s+/g, '');
    const tieneEvasionCompleta = this.palabrasVetadas.some(palabra => {
      const palabraNorm = this.normalizar(palabra);
      const palabraVetadaUnida = this.unirCaracteresSeparados(palabraNorm);
      
      // Solo verificar palabras individuales para evasión completa
      if (!palabraNorm.includes(' ') && palabraVetadaUnida.length >= 4) {
        return this.detectarPatronEvasion(textoCompletoSinEspacios, palabraVetadaUnida);
      }
      return false;
    });
    
    if (tieneEvasionCompleta) {
      return true;
    }
    
    // 2. Verificar palabras individuales y frases
    return this.palabrasVetadas.some(palabra => {
      const palabraNorm = this.normalizar(palabra);
      
      // Para frases completas (palabras con espacios), buscar coincidencia exacta en todo el texto
      if (palabraNorm.includes(' ')) {
        const textoUnido = this.unirCaracteresSeparados(textoNormal);
        const palabraVetadaUnida = this.unirCaracteresSeparados(palabraNorm);
        return textoUnido.includes(palabraVetadaUnida);
      }
      
      // Para palabras individuales, verificar tanto palabras completas como ocultas
      return palabrasTexto.some(palabraTexto => {
        const palabraTextoUnida = this.unirCaracteresSeparados(palabraTexto);
        const palabraVetadaUnida = this.unirCaracteresSeparados(palabraNorm);
        
        // 1. Coincidencia exacta de palabra completa
        if (palabraTextoUnida === palabraVetadaUnida) {
          return true;
        }
        
        // 2. Detectar palabras vetadas ocultas en palabras más largas
        // Solo si la palabra vetada tiene 4+ caracteres y la palabra del texto es significativamente más larga
        if (palabraVetadaUnida.length >= 4 && 
            palabraTextoUnida.length > palabraVetadaUnida.length + 2 &&
            palabraTextoUnida.includes(palabraVetadaUnida)) {
          
          // Verificar que no sea una palabra común que contenga la vetada
          const palabrasComunes = [
            'genérica', 'generica', 'america', 'americana', 'americano',
            'practico', 'practica', 'pruebas', 'prueba', 'calibrar',
            'fabricar', 'fabrica', 'publico', 'publica', 'republicano',
            'republica', 'clasificar', 'clasifica', 'especificar',
            'especifica', 'modificar', 'modifica', 'verificar',
            'verifica', 'certificar', 'certifica', 'identificar',
            'identifica', 'duplicar', 'duplica', 'multiplicar',
            'multiplica', 'complicar', 'complica', 'explicar',
            'explica', 'aplicar', 'aplica', 'implicar', 'implica',
            'replicar', 'replica', 'comunicar', 'comunica',
            'lubricar', 'lubrica', 'comunicación', 'comunicacion',
            'fabricacion', 'fabricación', 'ubicacion', 'ubicación',
            'dedicacion', 'dedicación', 'medicacion', 'medicación',
            'educacion', 'educación', 'predicacion', 'predicación',
            'calificacion', 'calificación', 'clasificacion', 'clasificación',
            'historia', 'historico', 'historica', 'historiador',
            'instancia', 'instanciar', 'institucion', 'institucional',
            'construccion', 'construcción', 'instruccion', 'instrucción',
            'destruccion', 'destrucción', 'obstruccion', 'obstrucción',
            'abstracto', 'abstracta', 'concreto', 'concreta',
            'discreto', 'discreta', 'secreto', 'secreta',
            'atlético', 'atletica', 'matemático', 'matematica',
            'automático', 'automatica', 'democrático', 'democratica',
            'aristocrático', 'aristocratica', 'burocrático', 'burocratica', 'analista'
          ];
          
          const palabraOriginal = palabraTexto.toLowerCase();
          const esPalabraComun = palabrasComunes.some(comun => 
            this.unirCaracteresSeparados(this.normalizar(comun)) === palabraTextoUnida
          );
          
          // Detectar patrones de evasión intencional
          const tienePatronEvasion = this.detectarPatronEvasion(palabraTexto, palabraVetadaUnida);
          
          return !esPalabraComun && tienePatronEvasion;
        }
        
        return false;
      });
    });
  }
}