import {useEffect, useMemo, useState} from 'react';

import {FolderOpenOutlined, FolderOutlined, FormatPainterOutlined} from '@ant-design/icons';

import {ROOT_FILE_ENTRY} from '@constants/constants';
import {
  FileExplorerTabTooltip,
  HelmTabTooltip,
  KustomizeTabTooltip,
  TemplatesTabTooltip,
  ValidationTabTooltip,
} from '@constants/tooltips';

import {LeftMenuSelectionType} from '@models/ui';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {setLeftMenuSelection, toggleLeftMenu} from '@redux/reducers/ui';
import {activeProjectSelector, kustomizationsSelector} from '@redux/selectors';

import WalkThrough from '@components/molecules/WalkThrough';

import {FeatureFlag} from '@utils/features';
import {SELECT_LEFT_TOOL_PANEL, trackEvent} from '@utils/telemetry';

import Colors from '@styles/Colors';

import {HELM_CHART_SECTION_NAME} from '@src/navsections/HelmChartSectionBlueprint';
import {KUSTOMIZATION_SECTION_NAME} from '@src/navsections/KustomizationSectionBlueprint';
import {KUSTOMIZE_PATCH_SECTION_NAME} from '@src/navsections/KustomizePatchSectionBlueprint';

import MenuButton from './MenuButton';
import MenuIcon from './MenuIcon';
import * as S from './PaneManagerLeftMenu.styled';
import PaneTooltip from './PaneTooltip';

const PaneManagerLeftMenu: React.FC = () => {
  const dispatch = useAppDispatch();
  const activeProject = useAppSelector(activeProjectSelector);
  const fileMap = useAppSelector(state => state.main.fileMap);
  const leftActive = useAppSelector(state => state.ui.leftMenu.isActive);
  const leftMenuSelection = useAppSelector(state => state.ui.leftMenu.selection);
  const helmCharts = useAppSelector(state => Object.values(state.main.helmChartMap));
  const highlightedItems = useAppSelector(state => state.ui.highlightedItems);
  const kustomizations = useAppSelector(kustomizationsSelector);
  const isActive = Boolean(activeProject) && leftActive;

  const [hasSeenKustomizations, setHasSeenKustomizations] = useState<boolean>(false);
  const [hasSeenHelmCharts, setHasSeenHelmCharts] = useState<boolean>(false);

  const isFolderOpen = useMemo(() => Boolean(fileMap[ROOT_FILE_ENTRY]), [fileMap]);
  const rootFileEntry = useMemo(() => fileMap[ROOT_FILE_ENTRY], [fileMap]);

  const setLeftActiveMenu = (selectedMenu: LeftMenuSelectionType) => {
    if (leftMenuSelection === selectedMenu) {
      dispatch(toggleLeftMenu());
    } else {
      trackEvent(SELECT_LEFT_TOOL_PANEL, {panelID: selectedMenu});
      dispatch(setLeftMenuSelection(selectedMenu));

      if (!leftActive) {
        dispatch(toggleLeftMenu());
      }
    }
  };

  useEffect(() => {
    if (leftActive && leftMenuSelection === 'kustomize-pane') {
      setHasSeenKustomizations(true);
    }
    if (leftActive && leftMenuSelection === 'helm-pane') {
      setHasSeenHelmCharts(true);
    }
  }, [leftActive, leftMenuSelection]);

  useEffect(() => {
    setHasSeenKustomizations(false);
    setHasSeenHelmCharts(false);
  }, [rootFileEntry]);

  return (
    <S.Container id="LeftToolbar" isLeftActive={isActive}>
      <PaneTooltip
        show={!leftActive || !(leftMenuSelection === 'file-explorer')}
        title={<FileExplorerTabTooltip />}
        placement="right"
      >
        <MenuButton
          id="file-explorer"
          isSelected={Boolean(activeProject) && leftMenuSelection === 'file-explorer'}
          isActive={isActive}
          shouldWatchSelectedPath
          onClick={() => setLeftActiveMenu('file-explorer')}
          disabled={!activeProject}
        >
          <MenuIcon
            style={{marginLeft: 4}}
            icon={isFolderOpen ? FolderOpenOutlined : FolderOutlined}
            active={isActive}
            isSelected={Boolean(activeProject) && leftMenuSelection === 'file-explorer'}
          />
        </MenuButton>
      </PaneTooltip>

      <PaneTooltip
        show={!leftActive || !(leftMenuSelection === 'kustomize-pane')}
        title={<KustomizeTabTooltip />}
        placement="right"
      >
        <MenuButton
          id="kustomize-pane"
          isSelected={Boolean(activeProject) && leftMenuSelection === 'kustomize-pane'}
          isActive={isActive}
          onClick={() => setLeftActiveMenu('kustomize-pane')}
          sectionNames={[KUSTOMIZATION_SECTION_NAME, KUSTOMIZE_PATCH_SECTION_NAME]}
          disabled={!activeProject}
        >
          <S.Badge
            count={!hasSeenKustomizations && kustomizations.length ? kustomizations.length : 0}
            color={Colors.blue6}
            size="default"
            dot
          >
            <MenuIcon
              iconName="kustomize"
              active={Boolean(activeProject) && leftActive}
              isSelected={Boolean(activeProject) && leftMenuSelection === 'kustomize-pane'}
            />
          </S.Badge>
        </MenuButton>
      </PaneTooltip>

      <WalkThrough placement="rightTop" step="kustomizeHelm" collection="novice">
        <PaneTooltip
          show={!leftActive || !(leftMenuSelection === 'helm-pane')}
          title={<HelmTabTooltip />}
          placement="right"
        >
          <MenuButton
            id="helm-pane"
            isSelected={Boolean(activeProject) && leftMenuSelection === 'helm-pane'}
            isActive={isActive}
            onClick={() => setLeftActiveMenu('helm-pane')}
            sectionNames={[HELM_CHART_SECTION_NAME]}
            disabled={!activeProject}
          >
            <S.Badge
              count={!hasSeenHelmCharts && helmCharts.length ? helmCharts.length : 0}
              color={Colors.blue6}
              size="default"
              dot
            >
              <MenuIcon
                iconName="helm"
                active={isActive}
                isSelected={Boolean(activeProject) && leftMenuSelection === 'helm-pane'}
              />
            </S.Badge>
          </MenuButton>
        </PaneTooltip>
      </WalkThrough>

      <FeatureFlag name="ImagesPane">
        <WalkThrough placement="leftTop" collection="release" step="images">
          <PaneTooltip
            show={!leftActive || !(leftMenuSelection === 'images-pane')}
            title="View Images"
            placement="right"
          >
            <MenuButton
              isSelected={Boolean(activeProject) && leftMenuSelection === 'images-pane'}
              isActive={isActive}
              onClick={() => setLeftActiveMenu('images-pane')}
              disabled={!activeProject}
            >
              <MenuIcon
                iconName="images"
                active={isActive}
                isSelected={Boolean(activeProject) && leftMenuSelection === 'images-pane'}
              />
            </MenuButton>
          </PaneTooltip>
        </WalkThrough>
      </FeatureFlag>

      <PaneTooltip
        show={!leftActive || !(leftMenuSelection === 'templates-pane')}
        title={TemplatesTabTooltip}
        placement="right"
      >
        <MenuButton
          isSelected={Boolean(activeProject) && leftMenuSelection === 'templates-pane'}
          isActive={isActive}
          onClick={() => setLeftActiveMenu('templates-pane')}
          disabled={!activeProject}
        >
          <MenuIcon
            className={highlightedItems.browseTemplates ? 'animated-highlight' : ''}
            style={highlightedItems.browseTemplates ? {fontSize: '20px', marginLeft: '2px'} : {}}
            icon={FormatPainterOutlined}
            active={isActive}
            isSelected={Boolean(activeProject) && leftMenuSelection === 'templates-pane'}
          />
        </MenuButton>
      </PaneTooltip>

      <PaneTooltip
        show={!leftActive || !(leftMenuSelection === 'validation')}
        title={<ValidationTabTooltip />}
        placement="right"
      >
        <MenuButton
          id="validation"
          isSelected={Boolean(activeProject) && leftMenuSelection === 'validation'}
          isActive={isActive}
          onClick={() => setLeftActiveMenu('validation')}
          disabled={!activeProject}
        >
          <MenuIcon
            iconName="validation"
            active={isActive}
            isSelected={Boolean(activeProject) && leftMenuSelection === 'validation'}
          />
        </MenuButton>
      </PaneTooltip>
    </S.Container>
  );
};

export default PaneManagerLeftMenu;
