import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface ReviewDistItem {
  name: string;
  value: number;
}

interface ReviewsAreaEChartProps {
  data: ReviewDistItem[];
}

export default function ReviewsAreaEChart({ data }: ReviewsAreaEChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    const chart = echarts.init(chartRef.current);
    chartInstance.current = chart;

    const names = data.map(item => item.name);
    const values = data.map(item => item.value);

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'line',
          lineStyle: {
            color: 'rgba(124, 92, 255, 0.4)',
            width: 1,
            type: 'dashed'
          }
        },
        backgroundColor: 'rgba(14, 17, 23, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderRadius: 12,
        padding: 10,
        textStyle: {
          color: '#ffffff',
          fontFamily: 'monospace',
          fontSize: 10
        },
        formatter: '{b}: <b style="color: #7C5CFF">{c} Establishments</b>'
      },
      grid: {
        left: '2%',
        right: '2%',
        bottom: '2%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: names,
        boundaryGap: false,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.4)',
          fontFamily: 'monospace',
          fontSize: 9
        }
      },
      yAxis: {
        type: 'value',
        splitLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.04)',
            type: 'dashed'
          }
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.4)',
          fontFamily: 'monospace',
          fontSize: 9
        }
      },
      series: [
        {
          name: 'Establishments',
          type: 'line',
          data: values,
          smooth: true,
          showSymbol: false,
          symbol: 'circle',
          symbolSize: 6,
          itemStyle: {
            color: '#7C5CFF'
          },
          lineStyle: {
            width: 3,
            color: '#7C5CFF'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(124, 92, 255, 0.45)' },
              { offset: 1, color: 'rgba(124, 92, 255, 0)' }
            ])
          }
        }
      ],
      animationEasing: 'cubicOut',
      animationDuration: 1100
    };

    chart.setOption(option);

    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });
    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
    };
  }, [data]);

  return <div ref={chartRef} className="w-full h-full" />;
}
