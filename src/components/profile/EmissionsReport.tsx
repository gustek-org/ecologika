
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const EmissionsReport = () => {
  // Dados fictícios para os gráficos
  const monthlyData = [
    { month: 'Jan', co2Saved: 45, purchases: 3 },
    { month: 'Fev', co2Saved: 67, purchases: 5 },
    { month: 'Mar', co2Saved: 123, purchases: 8 },
    { month: 'Abr', co2Saved: 89, purchases: 6 },
    { month: 'Mai', co2Saved: 156, purchases: 10 },
    { month: 'Jun', co2Saved: 178, purchases: 12 },
  ];

  const categoryData = [
    { category: 'Materiais', co2Saved: 245, color: '#10b981' },
    { category: 'Componentes', co2Saved: 189, color: '#059669' },
    { category: 'Equipamentos', co2Saved: 167, color: '#047857' },
    { category: 'Outros', co2Saved: 98, color: '#065f46' },
  ];

  const chartConfig = {
    co2Saved: {
      label: "CO₂ Economizado (kg)",
      color: "hsl(var(--chart-1))",
    },
    purchases: {
      label: "Compras",
      color: "hsl(var(--chart-2))",
    },
  };

  const totalCO2Saved = categoryData.reduce((sum, item) => sum + item.co2Saved, 0);
  const totalPurchases = monthlyData.reduce((sum, item) => sum + item.purchases, 0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Relatório de emissões</h3>
        <p className="text-gray-600">Acompanhe o impacto ambiental das suas compras sustentáveis</p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">CO₂ Total Economizado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalCO2Saved} kg</div>
            <p className="text-xs text-gray-500 mt-1">Equivale a {Math.round(totalCO2Saved / 22)} árvores plantadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Compras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalPurchases}</div>
            <p className="text-xs text-gray-500 mt-1">Produtos sustentáveis adquiridos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Média Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{Math.round(totalCO2Saved / 6)} kg</div>
            <p className="text-xs text-gray-500 mt-1">CO₂ economizado por mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de linha - Evolução mensal */}
      <Card>
        <CardHeader>
          <CardTitle>Evolução da Economia de CO₂</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="co2Saved" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras - Compras por mês */}
        <Card>
          <CardHeader>
            <CardTitle>Compras por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="purchases" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gráfico de pizza - CO₂ por categoria */}
        <Card>
          <CardHeader>
            <CardTitle>CO₂ Economizado por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="co2Saved"
                    label={({ category, co2Saved }) => `${category}: ${co2Saved}kg`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmissionsReport;
