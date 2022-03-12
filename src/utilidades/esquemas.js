export const esquemaIntervalos = {
  fecha: {
    llaveFuente: 'date',
    descripcion: 'Fecha de JS ajustado a zona horaria de Colombia',
    tipo: Date,
  },
  promedio: {
    llaveFuente: 'mean',
    descripcion: 'Promedia/Media del modelo',
    tipo: Number,
  },
  medio: {
    llaveFuente: 'median',
    descripcion: '',
    tipo: Number,
  },
  estandar: {
    llaveFuente: 'std',
    descripcion: '',
    tipo: Number,
  },
  bajo50: {
    llaveFuente: 'low_50',
    descripcion: 'Mínimo intervalo de confianza en 50',
    tipo: Number,
  },
  alto50: {
    llaveFuente: 'high_50',
    descripcion: 'Máximo intervalo de confianza en 50',
    tipo: Number,
  },
  bajo80: {
    llaveFuente: 'low_80',
    descripcion: 'Mínimo intervalo de confianza en 80',
    tipo: Number,
  },
  alto80: {
    llaveFuente: 'high_80',
    descripcion: 'Máximo intervalo de confianza en 80',
    tipo: Number,
  },
  bajo95: {
    llaveFuente: 'low_95',
    descripcion: 'Mínimo intervalo de confianza en 95',
    tipo: Number,
  },
  alto95: {
    llaveFuente: 'high_95',
    descripcion: 'Máximo intervalo de confianza en 95',
    tipo: Number,
  },
  tipo: {
    llaveFuente: 'type',
    descripcion: '',
    opciones: { estimate: 'estimado', forecast: 'pronostico' },
    tipo: String,
  },
};

export const esquemaCasos = {
  fecha: {
    llaveFuente: 'date',
    tipo: Date,
  },
  casos: {
    llaveFuente: 'num_cases',
    tipo: Number,
  },
  muertes: {
    llaveFuente: 'num_diseased',
    tipo: Number,
  },
  tipo: {
    llaveFuente: 'type',
    opciones: { fitted: 'ajustado', preliminary: 'preliminar' },
    tipo: String,
  },
};
