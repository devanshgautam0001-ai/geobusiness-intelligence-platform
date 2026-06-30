import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface AreaClusterItem {
  area: string;
  avgDigitalPresenceScore: number;
  avgGrowthOpportunityScore: number;
}

interface AreaClusterBarEChartProps {
  data: AreaClusterItem[];
}

export default function AreaClusterBarEChart({ data }: AreaClusterBarEChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    const chart = echarts.init(chartRef.current);
    chartInstance.current = chart;

    // We reverse the data to have the highest item on top in horizontal chart
    const reversedData = [...data].reverse();
    const areas = reversedData.map(item => item.area);
    const presenceScores = reversedData.map(item => Math.round(item.avgDigitalPresenceScore));
    const opportunityScores = reversedData.map(item => Math.round(item.avgGrowthOpportunityScore));

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
          shadowStyle: {
            color: 'rgba(255, 255, 255, 0.02)'
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
        }
      },
      legend: {
        data: ['Presence Index', 'Opportunity Index'],
        textStyle: {
          color: 'rgba(255, 255, 255, 0.5)',
          fontFamily: 'monospace',
          fontSize: 9
        },
        top: 0,
        right: '5%',
        itemGap: 15
      },
      grid: {
        left: '2%',
        right: '5%',
        bottom: '2%',
        top: '15%',
        containLabel: true
      },
      xAxis: {
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
      yAxis: {
        type: 'category',
        data: areas,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.5)',
          fontFamily: 'monospace',
          fontSize: 8,
          width: 100,
          overflow: 'truncate'
        }
      },
      series: [
        {
          name: 'Presence Index',
          type: 'bar',
          data: presenceScores,
          barWidth: '25%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: '#4F8CFF' },
              { offset: 1, color: '#32D583' }
            ]),
            borderRadius: [0, 4, 4, 0]
          }
        },
        {
          name: 'Opportunity Index',
          type: 'bar',
          data: opportunityScores,
          barWidth: '25%',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: 'rgba(255, 255, 255, 0.12)' },
              { offset: 1, color: 'rgba(255, 255, 255, 0.02)' }
            ]),
            borderRadius: [0, 4, 4, 0]
          }
        }
      ],
      animationEasing: 'cubicOut',
      animationDuration: 1000
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
