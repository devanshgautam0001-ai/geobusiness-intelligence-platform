import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface CategoryData {
  category: string;
  cafeCount: number;
  websitePercentage: number;
}

interface CategoryEChartProps {
  data: CategoryData[];
}

export default function CategoryEChart({ data }: CategoryEChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Clean up existing instance if any
    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    // Initialize ECharts with standard dark theme setup
    const chart = echarts.init(chartRef.current);
    chartInstance.current = chart;

    const categories = data.map(item => item.category);
    const cafeCounts = data.map(item => item.cafeCount);
    const websitePercentages = data.map(item => item.websitePercentage);

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
          shadowStyle: {
            color: 'rgba(255, 255, 255, 0.03)'
          }
        },
        backgroundColor: 'rgba(14, 17, 23, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        textStyle: {
          color: '#ffffff',
          fontFamily: 'monospace',
          fontSize: 11
        },
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        shadowBlur: 10
      },
      legend: {
        data: ['Establishments', 'Digital Ratio (%)'],
        textStyle: {
          color: 'rgba(255, 255, 255, 0.5)',
          fontFamily: 'monospace',
          fontSize: 10
        },
        top: 0,
        right: '5%',
        itemGap: 20
      },
      grid: {
        left: '2%',
        right: '2%',
        bottom: '5%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categories,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.4)',
          fontFamily: 'monospace',
          fontSize: 9,
          interval: 0,
          rotate: categories.length > 5 ? 15 : 0
        }
      },
      yAxis: [
        {
          type: 'value',
          name: 'Count',
          position: 'left',
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
          },
          nameTextStyle: {
            color: 'rgba(255, 255, 255, 0.3)',
            fontFamily: 'monospace',
            fontSize: 9
          }
        },
        {
          type: 'value',
          name: 'Ratio (%)',
          position: 'right',
          min: 0,
          max: 100,
          splitLine: {
            show: false
          },
          axisLabel: {
            color: 'rgba(255, 255, 255, 0.4)',
            fontFamily: 'monospace',
            fontSize: 9,
            formatter: '{value}%'
          },
          nameTextStyle: {
            color: 'rgba(255, 255, 255, 0.3)',
            fontFamily: 'monospace',
            fontSize: 9
          }
        }
      ],
      series: [
        {
          name: 'Establishments',
          type: 'bar',
          data: cafeCounts,
          barWidth: '35%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#4F8CFF' },
              { offset: 1, color: '#7C5CFF' }
            ]),
            borderRadius: [6, 6, 0, 0]
          },
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(255, 255, 255, 0.01)'
          }
        },
        {
          name: 'Digital Ratio (%)',
          type: 'line',
          yAxisIndex: 1,
          data: websitePercentages,
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: {
            color: '#32D583'
          },
          lineStyle: {
            width: 3,
            shadowColor: 'rgba(50, 213, 131, 0.3)',
            shadowBlur: 8,
            shadowOffsetY: 4
          }
        }
      ],
      animationEasing: 'cubicOut',
      animationDuration: 1000
    };

    chart.setOption(option);

    // Dynamic resize handler using ResizeObserver
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
