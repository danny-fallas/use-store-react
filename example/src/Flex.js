const Flex = ({ children, style, ...props }) => {
	let styles = {
		display: 'flex',
		flexDirection: props.flexDirection || 'column',
		flexWrap: props.flexWrap || 'nowrap',
		...style
	};

	if (props.fullWidth) styles.width = '100%';

	return (<>
		<div
			className={props.className}
			style={styles}
			onClick={props.onClick}>
			{children}
		</div>
	</>);
};

export default Flex;
