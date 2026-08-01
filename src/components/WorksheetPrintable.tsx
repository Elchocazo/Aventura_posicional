import React, { useMemo } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { GradeLevel, GameMode } from '../types';
import { LEVEL_CONFIGS, STORY_THEMES } from '../data/constants';

interface WorksheetPrintableProps {
  gradeLevel: GradeLevel;
  currentMode?: GameMode;
  printCounter?: number;
}

export const WorksheetPrintable: React.FC<WorksheetPrintableProps> = ({
  gradeLevel,
  currentMode = 'add',
  printCounter = 1,
}) => {
  const config = LEVEL_CONFIGS[gradeLevel];
  const cols = config.cols;

  // Generate exactly 12 story exercises (6 for Page 1, 6 for Page 2)
  const worksheetData = useMemo(() => {
    const exercises = [];
    const answersData = [];

    for (let i = 1; i <= 12; i++) {
      let op = currentMode;
      if (op === 'mix') {
        op = i % 2 === 0 ? 'add' : 'sub';
      }

      const raw1 = Math.floor(Math.random() * (config.max1 - config.min1 + 1)) + config.min1;
      const raw2 = Math.floor(Math.random() * (config.max2 - config.min2 + 1)) + config.min2;

      let n1 = raw1;
      let n2 = raw2;
      let sign = '+';

      if (op === 'sub') {
        sign = '-';
        n1 = Math.max(raw1, raw2);
        n2 = Math.min(raw1, raw2);
      }

      const expectedRes = sign === '+' ? n1 + n2 : n1 - n2;
      answersData.push({ id: i, n1, n2, op: sign, res: expectedRes });

      const theme = STORY_THEMES[(i - 1) % STORY_THEMES.length];
      const storyText = op === 'add'
        ? theme.addStory(n1.toLocaleString(), n2.toLocaleString())
        : theme.subStory(n1.toLocaleString(), n2.toLocaleString());
      const questionText = op === 'add' ? theme.addQuestion : theme.subQuestion;

      exercises.push({
        id: i,
        theme,
        storyText,
        questionText,
        n1,
        n2,
        sign,
      });
    }

    const payload = {
      sheet: printCounter,
      level: config.label,
      ans: answersData,
    };

    return {
      exercises,
      qrJson: JSON.stringify(payload),
    };
  }, [gradeLevel, currentMode, printCounter, config]);

  const page1Exercises = worksheetData.exercises.slice(0, 6);
  const page2Exercises = worksheetData.exercises.slice(6, 12);

  return (
    <div className="print-worksheet hidden print:block bg-white text-slate-900 font-sans w-full">
      {/* PAGE 1 */}
      <div className="print-page flex flex-col justify-between min-h-[256mm] p-2 box-border">
        {/* Header Page 1 */}
        <div className="print-header flex items-start justify-between border-b-3 border-black pb-2 mb-3">
          <div className="flex-1">
            <h1 className="text-xl font-black uppercase tracking-wide text-black">
              🦉 FICHA DE EJERCICIOS DE VALOR POSICIONAL N° {printCounter}
            </h1>
            <p className="text-sm font-extrabold text-slate-700 mt-0.5">
              Grado: {config.label} • Educación Primaria
            </p>
            <div className="flex justify-between items-center text-sm font-bold mt-2 pr-4">
              <span>Estudiante: _________________________________________</span>
              <span>Fecha: ______________</span>
            </div>
          </div>

          <div className="flex flex-col items-center pl-3 border-l-2 border-slate-300 shrink-0">
            <QRCodeCanvas value={worksheetData.qrJson} size={80} className="border-2 border-black" />
            <span className="text-[10px] font-black text-slate-800 mt-1">📱 Escanea para Calificar</span>
          </div>
        </div>

        {/* 6 Exercises Grid Page 1 */}
        <div className="grid grid-cols-2 gap-3.5 flex-1 align-content-stretch">
          {page1Exercises.map((ex) => (
            <div
              key={ex.id}
              className="border-2 border-slate-800 rounded-2xl p-3 bg-white flex flex-col justify-between h-[215px]"
            >
              <div className="font-black text-xs text-black border-b border-slate-800 pb-1 mb-1.5 flex justify-between">
                <span>Ejercicio #{ex.id}</span>
                <span>Operación: {ex.sign === '+' ? 'Suma' : 'Resta'}</span>
              </div>

              <div className="flex items-start justify-between gap-2 flex-1">
                <div className="text-xs font-bold leading-relaxed text-slate-900 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-base mr-1">{ex.theme.icon}</span>
                    <span>{ex.storyText}</span>
                  </div>
                  <div className="font-black text-black mt-1 text-[11px]">{ex.questionText}</div>
                </div>

                {/* Positional Grid Table */}
                <div className="shrink-0">
                  <table className="p-table border-collapse text-center font-mono text-sm font-bold">
                    <thead>
                      <tr>
                        <th className="border-none bg-transparent"></th>
                        {cols.map((c) => (
                          <th key={c} className="border border-slate-800 bg-slate-200 text-[10px] px-1.5 py-0.5">
                            {c.toUpperCase()}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Carry row */}
                      <tr className="border-dashed">
                        <td className="border-none"></td>
                        {cols.map((c) => (
                          <td key={c} className="border border-dashed border-slate-400 h-5 w-7"></td>
                        ))}
                      </tr>
                      {/* Operand 1 */}
                      <tr>
                        <td className="border-none"></td>
                        {cols.map((c) => (
                          <td key={c} className="border border-slate-800 h-6 w-7 bg-white"></td>
                        ))}
                      </tr>
                      {/* Operand 2 */}
                      <tr>
                        <td className="border-none text-xs font-black pr-1">{ex.sign}</td>
                        {cols.map((c) => (
                          <td key={c} className="border border-slate-800 h-6 w-7 bg-white"></td>
                        ))}
                      </tr>
                      {/* Result */}
                      <tr>
                        <td className="border-none text-xs font-black pr-1">=</td>
                        {cols.map((c) => (
                          <td key={c} className="border-2 border-black h-7 w-7 bg-yellow-50"></td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center text-[10px] font-bold text-slate-500 mt-2 border-t border-dashed border-slate-300 pt-1">
          Aventura Posicional • Ficha práctica (Página 1 de 2 - Ejercicios 1 a 6) • Acomoda cada dígito en su columna y resuelve a mano
        </div>
      </div>

      <div className="page-break print-page-break"></div>

      {/* PAGE 2 */}
      <div className="print-page flex flex-col justify-between min-h-[256mm] p-2 box-border mt-4">
        {/* Header Page 2 */}
        <div className="print-header flex items-center justify-between border-b-2 border-black pb-2 mb-3">
          <div className="flex-1">
            <h2 className="text-base font-black uppercase tracking-wide text-black">
              🦉 FICHA DE EJERCICIOS DE VALOR POSICIONAL N° {printCounter} • PÁGINA 2 DE 2
            </h2>
            <p className="text-xs font-bold text-slate-600 mt-0.5">
              Continuación de Ejercicios #7 a #12 • Grado: {config.label}
            </p>
          </div>

          <div className="flex flex-col items-center pl-3 border-l-2 border-slate-300 shrink-0">
            <QRCodeCanvas value={worksheetData.qrJson} size={75} className="border-2 border-black" />
            <span className="text-[10px] font-black text-slate-800 mt-1">📱 Escanea para Calificar</span>
          </div>
        </div>

        {/* 6 Exercises Grid Page 2 */}
        <div className="grid grid-cols-2 gap-3.5 flex-1 align-content-stretch">
          {page2Exercises.map((ex) => (
            <div
              key={ex.id}
              className="border-2 border-slate-800 rounded-2xl p-3 bg-white flex flex-col justify-between h-[215px]"
            >
              <div className="font-black text-xs text-black border-b border-slate-800 pb-1 mb-1.5 flex justify-between">
                <span>Ejercicio #{ex.id}</span>
                <span>Operación: {ex.sign === '+' ? 'Suma' : 'Resta'}</span>
              </div>

              <div className="flex items-start justify-between gap-2 flex-1">
                <div className="text-xs font-bold leading-relaxed text-slate-900 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-base mr-1">{ex.theme.icon}</span>
                    <span>{ex.storyText}</span>
                  </div>
                  <div className="font-black text-black mt-1 text-[11px]">{ex.questionText}</div>
                </div>

                {/* Positional Grid Table */}
                <div className="shrink-0">
                  <table className="p-table border-collapse text-center font-mono text-sm font-bold">
                    <thead>
                      <tr>
                        <th className="border-none bg-transparent"></th>
                        {cols.map((c) => (
                          <th key={c} className="border border-slate-800 bg-slate-200 text-[10px] px-1.5 py-0.5">
                            {c.toUpperCase()}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Carry row */}
                      <tr className="border-dashed">
                        <td className="border-none"></td>
                        {cols.map((c) => (
                          <td key={c} className="border border-dashed border-slate-400 h-5 w-7"></td>
                        ))}
                      </tr>
                      {/* Operand 1 */}
                      <tr>
                        <td className="border-none"></td>
                        {cols.map((c) => (
                          <td key={c} className="border border-slate-800 h-6 w-7 bg-white"></td>
                        ))}
                      </tr>
                      {/* Operand 2 */}
                      <tr>
                        <td className="border-none text-xs font-black pr-1">{ex.sign}</td>
                        {cols.map((c) => (
                          <td key={c} className="border border-slate-800 h-6 w-7 bg-white"></td>
                        ))}
                      </tr>
                      {/* Result */}
                      <tr>
                        <td className="border-none text-xs font-black pr-1">=</td>
                        {cols.map((c) => (
                          <td key={c} className="border-2 border-black h-7 w-7 bg-yellow-50"></td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center text-[10px] font-bold text-slate-500 mt-2 border-t border-dashed border-slate-300 pt-1">
          Aventura Posicional • Ficha práctica (Página 2 de 2 - Ejercicios 7 a 12) • Acomoda cada dígito en su columna y resuelve a mano
        </div>
      </div>
    </div>
  );
};
