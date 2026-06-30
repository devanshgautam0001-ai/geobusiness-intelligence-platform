import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface WebsitePieEChartProps {
  websitePercentage: number;
  noWebsitePercentage: number;
}

export default function WebsitePieEChart({ websitePercentage, noWebsitePercentage }: WebsitePieEChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    const chart = echarts.init(chartRef.current);
    chartInstance.current = chart;

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
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
        formatter: '{b}: <b style="color: #4F8CFF">{c}%</b>'
      },
      series: [
        {
          name: 'Domain Penetration',
          type: 'pie',
          radius: ['68%', '82%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#050505',
            borderWidth: 3
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: false
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(79, 140, 255, 0.3)'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            {
              value: websitePercentage,
              name: 'Digital Footprint (Online)',
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#4F8CFF' },
                  { offset: 1, color: '#7C5CFF' }
                ])
              }
            },
            {
              value: noWebsitePercentage,
              name: 'Missing Presence (Offline)',
              itemStyle: {
                color: '#EF4444'
              }
            }
          ]
        }
      ],
      animationEasing: 'cubicOut',
      animationDuration: 1200
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
  }, [websitePercentage, noWebsitePercentage]);

  return <div ref={chartRef} className="w-full h-full" />;
}
