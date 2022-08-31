import {
  Button,
  FilterIcon,
  Input,
  QuestionMarkFillIcon,
  Select,
  Switch,
  Tooltip,
} from '@databricks/design-system';
import { Theme } from '@emotion/react';
import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { ExperimentSearchSyntaxDocUrl } from '../../../../../common/constants';
import Utils from '../../../../../common/utils/Utils';
import {
  ExperimentCategorizedUncheckedKeys,
  LIFECYCLE_FILTER,
  MODEL_VERSION_FILTER,
  UpdateExperimentSearchFacetsFn,
} from '../../../../types';
import { RunsTableColumnSelectionDropdown } from '../../../RunsTableColumnSelectionDropdown';
import { SearchExperimentRunsFacetsState } from '../../models/SearchExperimentRunsFacetsState';
import { ExperimentRunsSelectorResult } from '../../utils/experimentRuns.selector';

// A default placeholder for the search box
const SEARCH_BOX_PLACEHOLDER = 'metrics.rmse < 1 and params.model = "tree"';

export type ExperimentViewRunsControlsFiltersProps = {
  searchFacetsState: SearchExperimentRunsFacetsState;
  updateSearchFacets: UpdateExperimentSearchFacetsFn;

  runsData: ExperimentRunsSelectorResult;
};

export const ExperimentViewRunsControlsFilters = React.memo(
  ({ searchFacetsState, updateSearchFacets, runsData }: ExperimentViewRunsControlsFiltersProps) => {
    const intl = useIntl();
    const { categorizedUncheckedKeys, lifecycleFilter, modelVersionFilter, diffSwitchSelected } =
      searchFacetsState;
    const { paramKeyList, metricKeyList, tagsList } = runsData;

    const [searchFilterValue, setSearchFilterValue] = useState<string>();
    const [filtersExpanded, setFiltersExpanded] = useState(false);
    const visibleTagKeyList = Utils.getVisibleTagKeyList(tagsList);

    const triggerSearch = () => {
      updateSearchFacets({ searchFilter: searchFilterValue });
    };
    useEffect(() => {
      setSearchFilterValue(searchFacetsState.searchFilter);
    }, [searchFacetsState]);

    return (
      <>
        <div css={styles.controlBar}>
          <RunsTableColumnSelectionDropdown
            paramKeyList={paramKeyList}
            metricKeyList={metricKeyList}
            visibleTagKeyList={visibleTagKeyList}
            categorizedUncheckedKeys={categorizedUncheckedKeys}
            onCheck={(newCategorizedUncheckedKeys: ExperimentCategorizedUncheckedKeys) => {
              updateSearchFacets({ categorizedUncheckedKeys: newCategorizedUncheckedKeys });
            }}
          />
          <>
            {intl.formatMessage({
              defaultMessage: 'Only show differences',
              description: 'Switch to select only columns with different values across runs',
            })}
            <Tooltip
              title={intl.formatMessage({
                defaultMessage: 'Only show columns with differences',
                description: 'Switch to select only columns with different values across runs',
              })}
            >
              <Switch
                css={styles.columnSwitch}
                data-test-id='diff-switch'
                checked={diffSwitchSelected}
                onChange={(newDiffSwitchSelected) =>
                  updateSearchFacets({ diffSwitchSelected: newDiffSwitchSelected })
                }
              />
            </Tooltip>
          </>
          <>
            <Tooltip
              title={
                <div className='search-input-tooltip-content'>
                  <FormattedMessage
                    defaultMessage='Search runs using a simplified version of the SQL {whereBold} clause'
                    description='Tooltip string to explain how to search runs from the experiments table'
                    values={{ whereBold: <b>WHERE</b> }}
                  />
                  <br />
                  <FormattedMessage
                    defaultMessage='<link>Learn more</link>'
                    description='Learn more tooltip link to learn more on how to search in an experiments run table'
                    values={{
                      link: (chunks: any) => (
                        <a
                          href={ExperimentSearchSyntaxDocUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          {chunks}
                        </a>
                      ),
                    }}
                  />
                </div>
              }
              placement='bottom'
            >
              <QuestionMarkFillIcon className='ExperimentView-search-help' />
            </Tooltip>
            <div css={styles.searchBox}>
              <Input
                value={searchFilterValue}
                prefix={<i className='fas fa-search' style={{ fontStyle: 'normal' }} />}
                onPressEnter={triggerSearch}
                onChange={(e) => setSearchFilterValue(e.target.value)}
                placeholder={SEARCH_BOX_PLACEHOLDER}
                data-test-id='search-box'
              />
              <span data-test-id='search-button'>
                <Button onClick={triggerSearch} data-test-id='search-button'>
                  <FormattedMessage
                    defaultMessage='Search'
                    description='String for the search button to search objects in MLflow'
                  />
                </Button>
              </span>
            </div>
            <Button
              data-testid='filter-button'
              onClick={() =>
                setFiltersExpanded((filtersCurrentlyExpanded) => !filtersCurrentlyExpanded)
              }
              icon={<FilterIcon />}
            >
              <FormattedMessage
                defaultMessage='Filter'
                description='String for the filter button to filter experiment runs table which match the search criteria'
              />
            </Button>
            <Button
              data-test-id='clear-button'
              onClick={() =>
                /**
                 * Clicking "clear" invokes new search while replacing sort/filter model with default values.
                 */
                updateSearchFacets(new SearchExperimentRunsFacetsState())
              }
            >
              <FormattedMessage
                defaultMessage='Clear'
                description='String for the clear button to clear any filters or sorting that we may have applied on the experiment table'
              />
            </Button>
          </>
        </div>
        {filtersExpanded && (
          <div css={styles.lifecycleFilters}>
            <FormattedMessage
              defaultMessage='State:'
              description='Filtering label to filter experiments based on state of active or deleted'
            />
            <Select
              value={lifecycleFilter}
              data-testid='lifecycle-filter'
              onChange={(value) => updateSearchFacets({ lifecycleFilter: value })}
            >
              <Select.Option data-testid='active-runs-menu-item' value={LIFECYCLE_FILTER.ACTIVE}>
                <FormattedMessage
                  defaultMessage='Active'
                  description='Linked model dropdown option to show active experiment runs'
                />
              </Select.Option>
              <Select.Option data-testid='deleted-runs-menu-item' value={LIFECYCLE_FILTER.DELETED}>
                <FormattedMessage
                  defaultMessage='Deleted'
                  description='Linked model dropdown option to show deleted experiment runs'
                />
              </Select.Option>
            </Select>
            <FormattedMessage
              defaultMessage='Linked Models:'
              description='Filtering label for filtering experiments based on if the models are linked or not to the experiment'
            />
            <Select
              value={modelVersionFilter}
              onChange={(value) => updateSearchFacets({ modelVersionFilter: value })}
            >
              <Select.Option data-testid='all-runs-menu-item' value={MODEL_VERSION_FILTER.ALL_RUNS}>
                <FormattedMessage
                  defaultMessage='All Runs'
                  description='Linked model dropdown option to show all experiment runs'
                />
              </Select.Option>
              <Select.Option
                data-testid='model-versions-runs-menu-item'
                value={MODEL_VERSION_FILTER.WITH_MODEL_VERSIONS}
              >
                <FormattedMessage
                  defaultMessage='With Model Versions'
                  description='Linked model dropdown option to show experiment runs with model versions only'
                />
              </Select.Option>
              <Select.Option
                data-testid='no-model-versions-runs-menu-item'
                value={MODEL_VERSION_FILTER.WTIHOUT_MODEL_VERSIONS}
              >
                <FormattedMessage
                  defaultMessage='Without Model Versions'
                  description='Linked model dropdown option to show experiment runs without model versions only'
                />
              </Select.Option>
            </Select>
          </div>
        )}
      </>
    );
  },
);

const styles = {
  controlBar: (theme: Theme) => ({ display: 'flex', gap: theme.spacing.sm, alignItems: 'center' }),
  columnSwitch: { margin: '5px' },
  searchBox: (theme: Theme) => ({ display: 'flex', gap: theme.spacing.sm, width: 400 }),
  lifecycleFilters: (theme: Theme) => ({
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.lg * 2,
  }),
};
