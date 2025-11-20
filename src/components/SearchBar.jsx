import { Search } from 'lucide-react';
import PropTypes from 'prop-types';
import Select from './Select';
import Button from './Button';

const SearchBar = ({
  searchType,
  onSearchTypeChange,
  searchQuery,
  onSearchQueryChange,
  onSearch,
  searchTypeOptions = [],
  placeholder = 'Buscar...',
  loading = false
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="flex gap-3">
      {searchTypeOptions.length > 0 && (
        <div className="w-48">
          <Select
            value={searchType}
            onChange={onSearchTypeChange}
            options={searchTypeOptions}
          />
        </div>
      )}
      <div className="flex-1 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      </div>
      <Button
        variant="primary"
        icon={<Search size={20} />}
        onClick={onSearch}
        loading={loading}
      >
        Buscar
      </Button>
    </div>
  );
};

SearchBar.propTypes = {
  searchType: PropTypes.string,
  onSearchTypeChange: PropTypes.func,
  searchQuery: PropTypes.string,
  onSearchQueryChange: PropTypes.func,
  onSearch: PropTypes.func,
  searchTypeOptions: PropTypes.array,
  placeholder: PropTypes.string,
  loading: PropTypes.bool
};

export default SearchBar;
