
import React from 'react';
import Select, { SingleValue } from 'react-select';
import { Label } from '@/components/ui/label';

// Lista de países com códigos e bandeiras (emoji)
const countries = [
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'CO', name: 'Colômbia', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: 'UY', name: 'Uruguai', flag: '🇺🇾' },
  { code: 'PY', name: 'Paraguai', flag: '🇵🇾' },
  { code: 'BO', name: 'Bolívia', flag: '🇧🇴' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'EC', name: 'Equador', flag: '🇪🇨' },
  { code: 'GY', name: 'Guiana', flag: '🇬🇾' },
  { code: 'SR', name: 'Suriname', flag: '🇸🇷' },
  { code: 'GF', name: 'Guiana Francesa', flag: '🇬🇫' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'CA', name: 'Canadá', flag: '🇨🇦' },
  { code: 'GT', name: 'Guatemala', flag: '🇬🇹' },
  { code: 'BZ', name: 'Belize', flag: '🇧🇿' },
  { code: 'SV', name: 'El Salvador', flag: '🇸🇻' },
  { code: 'HN', name: 'Honduras', flag: '🇭🇳' },
  { code: 'NI', name: 'Nicarágua', flag: '🇳🇮' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'PA', name: 'Panamá', flag: '🇵🇦' },
  { code: 'CU', name: 'Cuba', flag: '🇨🇺' },
  { code: 'JM', name: 'Jamaica', flag: '🇯🇲' },
  { code: 'HT', name: 'Haiti', flag: '🇭🇹' },
  { code: 'DO', name: 'República Dominicana', flag: '🇩🇴' },
  { code: 'PR', name: 'Porto Rico', flag: '🇵🇷' },
  { code: 'TT', name: 'Trinidad e Tobago', flag: '🇹🇹' },
  { code: 'BB', name: 'Barbados', flag: '🇧🇧' },
  { code: 'GD', name: 'Granada', flag: '🇬🇩' },
  { code: 'LC', name: 'Santa Lúcia', flag: '🇱🇨' },
  { code: 'VC', name: 'São Vicente e Granadinas', flag: '🇻🇨' },
  { code: 'AG', name: 'Antígua e Barbuda', flag: '🇦🇬' },
  { code: 'DM', name: 'Dominica', flag: '🇩🇲' },
  { code: 'KN', name: 'São Cristóvão e Nevis', flag: '🇰🇳' },
  { code: 'BS', name: 'Bahamas', flag: '🇧🇸' },
  { code: 'FR', name: 'França', flag: '🇫🇷' },
  { code: 'DE', name: 'Alemanha', flag: '🇩🇪' },
  { code: 'IT', name: 'Itália', flag: '🇮🇹' },
  { code: 'ES', name: 'Espanha', flag: '🇪🇸' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'GB', name: 'Reino Unido', flag: '🇬🇧' },
  { code: 'NL', name: 'Países Baixos', flag: '🇳🇱' },
  { code: 'BE', name: 'Bélgica', flag: '🇧🇪' },
  { code: 'CH', name: 'Suíça', flag: '🇨🇭' },
  { code: 'AT', name: 'Áustria', flag: '🇦🇹' },
  { code: 'SE', name: 'Suécia', flag: '🇸🇪' },
  { code: 'NO', name: 'Noruega', flag: '🇳🇴' },
  { code: 'DK', name: 'Dinamarca', flag: '🇩🇰' },
  { code: 'FI', name: 'Finlândia', flag: '🇫🇮' },
  { code: 'IS', name: 'Islândia', flag: '🇮🇸' },
  { code: 'IE', name: 'Irlanda', flag: '🇮🇪' },
  { code: 'LU', name: 'Luxemburgo', flag: '🇱🇺' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹' },
  { code: 'CY', name: 'Chipre', flag: '🇨🇾' },
  { code: 'GR', name: 'Grécia', flag: '🇬🇷' },
  { code: 'BG', name: 'Bulgária', flag: '🇧🇬' },
  { code: 'RO', name: 'Romênia', flag: '🇷🇴' },
  { code: 'HR', name: 'Croácia', flag: '🇭🇷' },
  { code: 'SI', name: 'Eslovênia', flag: '🇸🇮' },
  { code: 'SK', name: 'Eslováquia', flag: '🇸🇰' },
  { code: 'CZ', name: 'República Tcheca', flag: '🇨🇿' },
  { code: 'HU', name: 'Hungria', flag: '🇭🇺' },
  { code: 'PL', name: 'Polônia', flag: '🇵🇱' },
  { code: 'LT', name: 'Lituânia', flag: '🇱🇹' },
  { code: 'LV', name: 'Letônia', flag: '🇱🇻' },
  { code: 'EE', name: 'Estônia', flag: '🇪🇪' },
  { code: 'RU', name: 'Rússia', flag: '🇷🇺' },
  { code: 'UA', name: 'Ucrânia', flag: '🇺🇦' },
  { code: 'BY', name: 'Bielorrússia', flag: '🇧🇾' },
  { code: 'MD', name: 'Moldávia', flag: '🇲🇩' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'JP', name: 'Japão', flag: '🇯🇵' },
  { code: 'KR', name: 'Coreia do Sul', flag: '🇰🇷' },
  { code: 'KP', name: 'Coreia do Norte', flag: '🇰🇵' },
  { code: 'IN', name: 'Índia', flag: '🇮🇳' },
  { code: 'PK', name: 'Paquistão', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵' },
  { code: 'BT', name: 'Butão', flag: '🇧🇹' },
  { code: 'MV', name: 'Maldivas', flag: '🇲🇻' },
  { code: 'TH', name: 'Tailândia', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnã', flag: '🇻🇳' },
  { code: 'LA', name: 'Laos', flag: '🇱🇦' },
  { code: 'KH', name: 'Camboja', flag: '🇰🇭' },
  { code: 'MM', name: 'Mianmar', flag: '🇲🇲' },
  { code: 'MY', name: 'Malásia', flag: '🇲🇾' },
  { code: 'SG', name: 'Singapura', flag: '🇸🇬' },
  { code: 'ID', name: 'Indonésia', flag: '🇮🇩' },
  { code: 'PH', name: 'Filipinas', flag: '🇵🇭' },
  { code: 'BN', name: 'Brunei', flag: '🇧🇳' },
  { code: 'TL', name: 'Timor-Leste', flag: '🇹🇱' },
  { code: 'AU', name: 'Austrália', flag: '🇦🇺' },
  { code: 'NZ', name: 'Nova Zelândia', flag: '🇳🇿' },
  { code: 'FJ', name: 'Fiji', flag: '🇫🇯' },
  { code: 'PG', name: 'Papua-Nova Guiné', flag: '🇵🇬' },
  { code: 'SB', name: 'Ilhas Salomão', flag: '🇸🇧' },
  { code: 'VU', name: 'Vanuatu', flag: '🇻🇺' },
  { code: 'NC', name: 'Nova Caledônia', flag: '🇳🇨' },
  { code: 'PF', name: 'Polinésia Francesa', flag: '🇵🇫' },
  { code: 'WS', name: 'Samoa', flag: '🇼🇸' },
  { code: 'TO', name: 'Tonga', flag: '🇹🇴' },
  { code: 'TV', name: 'Tuvalu', flag: '🇹🇻' },
  { code: 'KI', name: 'Kiribati', flag: '🇰🇮' },
  { code: 'NR', name: 'Nauru', flag: '🇳🇷' },
  { code: 'PW', name: 'Palau', flag: '🇵🇼' },
  { code: 'MH', name: 'Ilhas Marshall', flag: '🇲🇭' },
  { code: 'FM', name: 'Micronésia', flag: '🇫🇲' },
].sort((a, b) => a.name.localeCompare(b.name));

interface CountryOption {
  value: string;
  label: string;
  flag: string;
}

interface CountrySelectImprovedProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export const CountrySelectImproved: React.FC<CountrySelectImprovedProps> = ({
  value,
  onValueChange,
  placeholder = "Selecione um país",
  label,
  required = false
}) => {
  const options: CountryOption[] = countries.map(country => ({
    value: country.name,
    label: country.name,
    flag: country.flag
  }));

  const selectedOption = options.find(option => option.value === value) || null;

  const formatOptionLabel = ({ label, flag }: CountryOption) => (
    <div className="flex items-center gap-2">
      <span className="text-lg">{flag}</span>
      <span>{label}</span>
    </div>
  );

  const handleChange = (selectedOption: SingleValue<CountryOption>) => {
    onValueChange(selectedOption ? selectedOption.value : '');
  };

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      minHeight: '40px',
      border: '1px solid hsl(var(--border))',
      borderRadius: '6px',
      backgroundColor: 'hsl(var(--background))',
      '&:hover': {
        border: '1px solid hsl(var(--border))'
      },
      '&:focus-within': {
        borderColor: 'hsl(var(--ring))',
        boxShadow: '0 0 0 2px hsl(var(--ring))'
      }
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: 'hsl(var(--background))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '6px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      zIndex: 50
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? 'hsl(var(--accent))' 
        : state.isFocused 
        ? 'hsl(var(--accent) / 0.5)' 
        : 'transparent',
      color: 'hsl(var(--foreground))',
      '&:hover': {
        backgroundColor: 'hsl(var(--accent) / 0.8)'
      }
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--muted-foreground))'
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--foreground))'
    })
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label>
          {label} {required && '*'}
        </Label>
      )}
      <Select
        value={selectedOption}
        onChange={handleChange}
        options={options}
        formatOptionLabel={formatOptionLabel}
        placeholder={placeholder}
        isSearchable
        isClearable
        styles={customStyles}
        className="react-select-container"
        classNamePrefix="react-select"
      />
    </div>
  );
};
