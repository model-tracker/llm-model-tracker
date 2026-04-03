import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  TooltipProps,
} from "recharts";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

interface LineChartData {
  id: string;
  month: string;
  count: number;
}

interface BarChartData {
  id: string;
  provider: string;
  models: number;
}

interface ModelReleasesChartProps {
  data: LineChartData[];
}

interface ProviderActivityChartProps {
  data: BarChartData[];
}

// Custom Tooltip for Line Chart
const CustomLineTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="text-sm font-semibold text-gray-900 mb-1">{label}</p>
        <p className="text-sm text-indigo-600">
          <span className="font-medium">{payload[0].value}</span> model{payload[0].value !== 1 ? 's' : ''} released
        </p>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Bar Chart
const CustomBarTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const provider = payload[0].payload.provider;
    const emoji = getProviderEmoji(provider);
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{emoji}</span>
          <p className="text-sm font-semibold text-gray-900">{provider}</p>
        </div>
        <p className="text-sm text-indigo-600">
          <span className="font-medium">{payload[0].value}</span> active model{payload[0].value !== 1 ? 's' : ''}
        </p>
      </div>
    );
  }
  return null;
};

// Provider emoji mapping (used in tooltip only)
function getProviderEmoji(provider: string): string {
  const emojiMap: Record<string, string> = {
    'OpenAI': '🤖',
    'Anthropic': '🧠',
    'Google': '✨',
    'Azure OpenAI': '☁️',
    'xAI': '⚡',
    'Amazon Bedrock': '📦'
  };
  return emojiMap[provider] || '🔮';
}

// Provider logo mapping
function getProviderLogo(provider: string): string {
  const logoMap: Record<string, string> = {
    'OpenAI': '/logos/openai.png',
    'Anthropic': '/logos/anthropic.png',
    'Google': '/logos/google.png',
    'Azure OpenAI': '/logos/azure.png',
    'xAI': '/logos/xai.png',
    'Amazon Bedrock': '/logos/amazon.png',
  };
  return logoMap[provider] || '';
}

// Provider color mapping
function getProviderColor(provider: string): string {
  const colorMap: Record<string, string> = {
    'OpenAI': '#10b981',      // Green
    'Anthropic': '#8b5cf6',   // Purple
    'Google': '#f59e0b',      // Amber
    'Azure OpenAI': '#3b82f6',// Blue
    'xAI': '#ef4444',         // Red
    'Amazon Bedrock': '#ec4899' // Pink
  };
  return colorMap[provider] || '#6366f1'; // Default indigo
}

export const ModelReleasesChart = ({ data }: ModelReleasesChartProps) => {
  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height: '300px' }}>
        <p className="text-sm text-gray-400">No data available</p>
      </div>
    );
  }

  // Validate data for NaN values
  const validData = data.map((item) => ({
    ...item,
    count: isNaN(item.count) ? 0 : item.count
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={validData}
        margin={{ top: 20, right: 20, left: -20, bottom: 5 }}
      >
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="#e5e7eb"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          stroke="#9ca3af"
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis
          stroke="#9ca3af"
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: '#e5e7eb' }}
          allowDecimals={false}
        />
        <Tooltip content={<CustomLineTooltip />} />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#6366f1"
          strokeWidth={3}
          dot={{
            fill: '#6366f1',
            strokeWidth: 2,
            r: 4,
            stroke: '#fff'
          }}
          activeDot={{
            r: 6,
            fill: '#6366f1',
            stroke: '#fff',
            strokeWidth: 2
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const ProviderActivityChart = ({ data }: ProviderActivityChartProps) => {
  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height: '300px' }}>
        <p className="text-sm text-gray-400">No data available</p>
      </div>
    );
  }

  // Validate data for NaN values and add colors
  const validData = data.map((item) => ({
    ...item,
    models: isNaN(item.models) ? 0 : item.models,
    fill: getProviderColor(item.provider)
  }));

  // Custom X-Axis Tick with logo + label
  const CustomXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const logo = getProviderLogo(payload.value);
    const label = payload.value === 'Azure OpenAI' ? 'Azure' :
                  payload.value === 'Amazon Bedrock' ? 'Bedrock' : payload.value;

    return (
      <g transform={`translate(${x},${y})`}>
        {logo && (
          <image
            href={logo}
            x={-10}
            y={4}
            width={20}
            height={20}
            preserveAspectRatio="xMidYMid meet"
          />
        )}
        <text
          x={0}
          y={30}
          textAnchor="middle"
          fill="#4b5563"
          fontSize={11}
        >
          {label}
        </text>
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={validData}
        margin={{ top: 20, right: 20, left: -20, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e5e7eb"
          vertical={false}
        />
        <XAxis
          dataKey="provider"
          stroke="#9ca3af"
          tickLine={false}
          axisLine={{ stroke: '#e5e7eb' }}
          tick={<CustomXAxisTick />}
          height={50}
        />
        <YAxis
          stroke="#9ca3af"
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: '#e5e7eb' }}
          allowDecimals={false}
        />
        <Tooltip content={<CustomBarTooltip />} />
        <Bar
          dataKey="models"
          radius={[8, 8, 0, 0]}
          maxBarSize={80}
        >
          {validData.map((entry, index) => (
            <Cell 
              key={`cell-${entry.id}-${index}`} 
              fill={entry.fill}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};