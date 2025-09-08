import styled from "styled-components";

const FlexBox = styled.div`
  display: flex;
  flex-direction: ${({ $flexDirection }) => $flexDirection || "row"};
  justify-content: ${({ $justifyContent }) => $justifyContent || "flex-start"};
  align-items: ${({ $alignItems }) => $alignItems || "flex-start"};
  gap: ${({ $gap }) => $gap || "10px"};
  width: ${({ $width }) => $width || "100%"};
  height: ${({ $height }) => $height || "auto"};
  padding: ${({ $padding }) => $padding};
  max-width: ${({ $maxWidth }) => $maxWidth || "100%"};
  min-height: ${({ $minHeight }) => $minHeight || "auto"};
`;

export default function FlexBoxComponent({
  flexDirection,
  justifyContent,
  alignItems,
  gap,
  width,
  height,
  children,
  padding,
  maxWidth,
  minHeight,
  ...props
}) {
  return (
    <FlexBox
      $flexDirection={flexDirection}
      $justifyContent={justifyContent}
      $alignItems={alignItems}
      $gap={gap}
      $width={width}
      $height={height}
      $padding={padding}
      $maxWidth={maxWidth}
      $minHeight={minHeight}
      {...props}
    >
      {children}
    </FlexBox>
  );
}
